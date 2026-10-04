export async function onRequestPost(context) {
  const apiKey = context.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'Missing API key' }, { status: 500 })
  }

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

  // Rough size check: base64 is ~4/3 of original bytes
  if (image.length > 7_000_000) {
    return Response.json({ error: 'Image too large (max ~5MB)' }, { status: 400 })
  }

  const prompt = `You are extracting structured data from a voucher, coupon, refund, or gift card image.

Return ONLY valid JSON with exactly these fields:
{
  "store": "<store or business name, in Hebrew if shown>",
  "code": "<the coupon/voucher/barcode number or code>",
  "amount": <numeric value only, no currency symbol>,
  "currency": "<₪ or $ or € — default ₪ if Israeli>",
  "type": "<one of: voucher, refund, gift, coupon>",
  "expiry": "<YYYY-MM-DD if found, else null>",
  "notes": "<brief note about what this is, in Hebrew if appropriate, else null>"
}

Rules:
- "code" is the most important field — extract the full alphanumeric code or barcode number
- "type" = refund if it's a store credit/החזר/זיכוי, gift if מתנה/gift card, coupon if discount code, voucher otherwise
- "amount" must be a number (e.g. 250), not a string
- If a field cannot be determined, use null
- Do not add any explanation, only the JSON object`

  const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-opus-5-5',
      max_tokens: 512,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: image },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  })

  if (!claudeRes.ok) {
    const err = await claudeRes.text()
    return Response.json({ error: `Claude API error: ${err}` }, { status: 502 })
  }

  const claudeData = await claudeRes.json()
  const text = claudeData.content?.find(b => b.type === 'text')?.text ?? ''

  let parsed
  try {
    // Strip any markdown fences the model may add
    const clean = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim()
    parsed = JSON.parse(clean)
  } catch {
    return Response.json({ error: 'Could not parse model response', raw: text }, { status: 502 })
  }

  return Response.json(parsed, {
    headers: { 'Access-Control-Allow-Origin': '*' },
  })
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}
