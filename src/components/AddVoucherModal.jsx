import { useState } from 'react'
import { X } from 'lucide-react'
import ImageScanner from './ImageScanner'

const TYPES = ['voucher', 'refund', 'gift', 'coupon']
const TYPE_LABELS = { voucher: 'שובר', refund: 'זיכוי', gift: 'מתנה', coupon: 'קופון' }

const EMPTY = { store: '', code: '', amount: '', currency: '₪', type: 'voucher', status: 'active', expiry: '', notes: '' }

export default function AddVoucherModal({ initial, onSave, onClose }) {
  const [form, setForm] = useState(initial ? { ...initial, amount: String(initial.amount) } : EMPTY)
  const [error, setError] = useState('')
  const [scanError, setScanError] = useState('')

  function set(field, val) {
    setForm(f => ({ ...f, [field]: val }))
  }

  function handleScanResult(data) {
    setScanError('')
    setForm(f => ({
      ...f,
      store:    data.store    || f.store,
      code:     data.code     || f.code,
      amount:   data.amount != null ? String(data.amount) : f.amount,
      currency: data.currency || f.currency,
      type:     ['voucher','refund','gift','coupon'].includes(data.type) ? data.type : f.type,
      expiry:   data.expiry   || f.expiry,
      notes:    data.notes    || f.notes,
    }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.store.trim()) return setError('נא להזין שם חנות')
    if (!form.code.trim()) return setError('נא להזין קוד')
    const amount = parseFloat(form.amount)
    if (!form.amount || isNaN(amount) || amount < 0) return setError('נא להזין סכום תקין')
    onSave({ ...form, amount })
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div
        className="bg-white w-full max-w-md rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800">{initial ? 'עריכת פריט' : 'הוסף פריט חדש'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={submit} className="flex flex-col gap-4">
          {/* OCR scanner */}
          {!initial && (
            <>
              <ImageScanner onResult={handleScanResult} onError={setScanError} />
              {scanError && <p className="text-orange-500 text-xs text-center -mt-2">{scanError}</p>}
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <div className="flex-1 h-px bg-gray-100" />
                או מלא ידנית
                <div className="flex-1 h-px bg-gray-100" />
              </div>
            </>
          )}

          {/* Type selector */}
          <div>
            <label className="text-sm text-gray-500 mb-1 block">סוג</label>
            <div className="flex gap-2">
              {TYPES.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set('type', t)}
                  className={`flex-1 py-1.5 rounded-full text-sm border transition ${
                    form.type === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200'
                  }`}
                >
                  {TYPE_LABELS[t]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">חנות *</label>
              <input
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.store}
                onChange={e => set('store', e.target.value)}
                placeholder="לדוג׳ אמזון"
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">סכום *</label>
              <div className="flex items-center border border-gray-200 rounded-xl px-3 py-2 gap-1 focus-within:ring-2 focus-within:ring-blue-400">
                <span className="text-gray-400 text-sm">₪</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="flex-1 text-sm focus:outline-none"
                  value={form.amount}
                  onChange={e => set('amount', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">קוד *</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.code}
              onChange={e => set('code', e.target.value)}
              placeholder="ABCD-1234-EFGH"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-gray-500 mb-1 block">תוקף עד</label>
              <input
                type="date"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.expiry}
                onChange={e => set('expiry', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm text-gray-500 mb-1 block">סטטוס</label>
              <select
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <option value="active">פעיל</option>
                <option value="used">נוצל</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-500 mb-1 block">הערות</label>
            <input
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              placeholder="הערה אופציונלית"
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition mt-1"
          >
            {initial ? 'שמור שינויים' : 'הוסף לארנק'}
          </button>
        </form>
      </div>
    </div>
  )
}
