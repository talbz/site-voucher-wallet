import { useState } from 'react'
import { Copy, Check, Edit2, Trash2, CheckCircle, Tag, RotateCcw, Gift, TrendingUp, Clock } from 'lucide-react'

const TYPE_LABELS = { voucher: 'שובר', refund: 'זיכוי', gift: 'מתנה', coupon: 'קופון' }
const TYPE_COLORS = {
  voucher: 'bg-blue-50 text-blue-600 border-blue-100',
  refund:  'bg-green-50 text-green-600 border-green-100',
  gift:    'bg-purple-50 text-purple-600 border-purple-100',
  coupon:  'bg-orange-50 text-orange-600 border-orange-100',
}
const TYPE_ICONS = { voucher: Tag, refund: RotateCcw, gift: Gift, coupon: TrendingUp }

function isExpiringSoon(expiry) {
  if (!expiry) return false
  const days = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24)
  return days >= 0 && days <= 30
}

function isExpired(expiry) {
  if (!expiry) return false
  return new Date(expiry) < new Date()
}

export default function VoucherCard({ voucher, onEdit, onDelete, onMarkUsed }) {
  const [copied, setCopied] = useState(false)

  function copyCode() {
    navigator.clipboard.writeText(voucher.code).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const Icon = TYPE_ICONS[voucher.type] || Tag
  const used = voucher.status === 'used'
  const expiring = !used && isExpiringSoon(voucher.expiry)
  const expired = !used && isExpired(voucher.expiry)

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-4 transition ${used ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`rounded-xl p-2.5 border ${TYPE_COLORS[voucher.type] || TYPE_COLORS.voucher}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-gray-800 text-base">{voucher.store}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${TYPE_COLORS[voucher.type] || TYPE_COLORS.voucher}`}>
              {TYPE_LABELS[voucher.type] || voucher.type}
            </span>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`text-2xl font-bold ${used ? 'text-gray-400' : 'text-blue-600'}`}>
            {voucher.currency || '₪'}{(voucher.amount || 0).toLocaleString()}
          </p>
          {used && <p className="text-xs text-gray-400 mt-0.5">נוצל</p>}
        </div>
      </div>

      {/* Code row */}
      <div className="mt-3 flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
        <code className="flex-1 text-sm text-gray-700 font-mono truncate">{voucher.code}</code>
        {!used && (
          <button onClick={copyCode} className="text-gray-400 hover:text-blue-500 transition flex-shrink-0">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Expiry + notes */}
      <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1">
          {voucher.expiry && (
            <>
              <Clock className="w-3 h-3" />
              <span className={expiring ? 'text-orange-500 font-medium' : expired ? 'text-red-400' : ''}>
                {expired ? 'פג תוקף' : expiring ? `פג בקרוב · ${new Date(voucher.expiry).toLocaleDateString('he-IL')}` : new Date(voucher.expiry).toLocaleDateString('he-IL')}
              </span>
            </>
          )}
        </div>
        {voucher.notes && <span className="truncate max-w-[140px] text-gray-400">{voucher.notes}</span>}
      </div>

      {/* Actions */}
      {!used && (
        <div className="mt-3 flex gap-2 justify-end">
          <button onClick={onMarkUsed} className="flex items-center gap-1 text-xs text-green-600 hover:text-green-700 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-full transition">
            <CheckCircle className="w-3.5 h-3.5" /> סמן כנוצל
          </button>
          <button onClick={onEdit} className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-600 bg-gray-100 hover:bg-blue-50 px-3 py-1.5 rounded-full transition">
            <Edit2 className="w-3.5 h-3.5" /> ערוך
          </button>
          <button onClick={onDelete} className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 bg-gray-100 hover:bg-red-50 px-3 py-1.5 rounded-full transition">
            <Trash2 className="w-3.5 h-3.5" /> מחק
          </button>
        </div>
      )}
    </div>
  )
}
