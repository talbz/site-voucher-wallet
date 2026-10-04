import { scan, getProviderName, listProviders } from '../lib/providers.js'

export async function onRequestPost(context) {
  let body
  try {
    body = await context.request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { image, mediaType } = body
  if (!image || !mediaType) {
    return Response.json({ error: 'Missing image or mediaType' }, { status: 400 })
  }
  if (image.length > 7_000_000) {
    return Response.json({ error: 'Image too large (max ~5MB)' }, { status: 400 })
  }

  try {
    const result = await scan(context.env, image, mediaType)
    return Response.json(result, {
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  } catch (err) {
    return Response.json(
      { error: err.message, provider: getProviderName(context.env) },
      { status: 502 }
    )
  }
}

// Returns current provider info — useful for the frontend to show which model is active
export async function onRequestGet(context) {
  return Response.json({
    provider: getProviderName(context.env),
    available: listProviders(),
  })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
