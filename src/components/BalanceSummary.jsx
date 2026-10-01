import { TrendingUp, Tag, RotateCcw, Gift } from 'lucide-react'

const TYPE_LABELS = { voucher: 'שוברים', refund: 'זיכויים', gift: 'מתנות', coupon: 'קופונים' }

export default function BalanceSummary({ vouchers, totalBalance }) {
  const active = vouchers.filter(v => v.status === 'active')
  const byType = ['voucher', 'refund', 'gift', 'coupon'].map(type => ({
    type,
    count: active.filter(v => v.type === type).length,
    total: active.filter(v => v.type === type).reduce((s, v) => s + (v.amount || 0), 0),
  })).filter(x => x.count > 0)

  const icons = { voucher: Tag, refund: RotateCcw, gift: Gift, coupon: TrendingUp }

  return (
    <div className="mb-6">
      {/* Main balance card */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl mb-4">
        <p className="text-blue-200 text-sm mb-1">סה"כ יתרה פעילה</p>
        <p className="text-4xl font-bold">₪{totalBalance.toLocaleString()}</p>
        <p className="text-blue-200 text-sm mt-2">{active.length} פריטים פעילים</p>
      </div>

      {/* Type breakdown */}
      {byType.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          {byType.map(({ type, count, total }) => {
            const Icon = icons[type] || Tag
            return (
              <div key={type} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-3">
                <div className="bg-blue-50 rounded-full p-2">
                  <Icon className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{TYPE_LABELS[type]}</p>
                  <p className="font-bold text-gray-800">₪{total.toLocaleString()}</p>
                  <p className="text-xs text-gray-400">{count} פריטים</p>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
