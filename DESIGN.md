# site-voucher-wallet — Design Document

## Purpose

A Hebrew-language voucher/coupon wallet — like Google Wallet but for managing store credits, gift cards, refunds, and coupon codes in one place.

## Stack

- **Frontend**: React 19 + Vite + Tailwind CSS 3
- **Backend**: Cloudflare Pages Functions (`/functions/api/`)
- **AI**: Claude claude-opus-5-5 via Anthropic API (vision OCR)
- **Deploy**: Cloudflare Pages

## Features

| Feature | Status |
|---------|--------|
| Balance summary card | ✅ Done |
| Voucher cards (store, code, amount, expiry, notes) | ✅ Done |
| Copy code to clipboard | ✅ Done |
| Filter by active / used / all | ✅ Done |
| Add / edit / delete voucher | ✅ Done |
| Mark as used | ✅ Done |
| Expiry warning (30 days) | ✅ Done |
| localStorage persistence | ✅ Done |
| OCR image scan → auto-fill form | ✅ Done (via `/api/scan`) |
| Camera capture (mobile) | ✅ Done |

## Data Model

```js
{
  id: number,          // Date.now()
  store: string,       // e.g. "המשביר לצרכן"
  code: string,        // e.g. "99100690000000397459"
  amount: number,      // e.g. 250
  currency: string,    // '₪' | '$' | '€'
  type: 'voucher' | 'refund' | 'gift' | 'coupon',
  status: 'active' | 'used',
  expiry: string,      // ISO date 'YYYY-MM-DD' or ''
  notes: string,       // free text
}
```

## API

### POST `/api/scan`
Accepts `{ image: string (base64), mediaType: string }`.  
Returns extracted voucher fields as JSON.  
Requires `ANTHROPIC_API_KEY` Cloudflare secret.

## Deploy

```bash
npm run build
npx wrangler pages deploy dist --project-name=site-voucher-wallet
```

Set the API key secret once:
```bash
npx wrangler pages secret put ANTHROPIC_API_KEY --project-name=site-voucher-wallet
```

## Regression Checklist

- [ ] Balance total = sum of active vouchers
- [ ] Add voucher → appears in list, balance updates
- [ ] Copy code → clipboard has correct value
- [ ] Mark used → card grays out, moves to "נוצלו" tab
- [ ] Edit → form pre-filled, save updates card
- [ ] Delete → removed from list and balance
- [ ] Expiry < 30 days → orange warning shown
- [ ] Scan image → form auto-filled with store, code, amount, expiry
- [ ] Scan error → friendly error message shown
- [ ] Data survives page refresh
