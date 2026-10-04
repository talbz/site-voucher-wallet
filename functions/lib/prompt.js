export const VOUCHER_PROMPT = `You are extracting structured data from a voucher, coupon, refund, or gift card image.

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
