import VoucherCard from './VoucherCard'

const FILTERS = [
  { key: 'active', label: 'פעילים' },
  { key: 'used', label: 'נוצלו' },
  { key: 'all', label: 'הכל' },
]

export default function VoucherList({ vouchers, filter, onFilterChange, onEdit, onDelete, onMarkUsed }) {
  return (
    <div>
      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {FILTERS.map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === f.key
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {vouchers.length === 0 ? (
        <div className="text-center text-gray-400 py-16">
          <p className="text-lg">אין פריטים</p>
          <p className="text-sm mt-1">לחץ על "הוסף" כדי להוסיף שובר או זיכוי</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {vouchers.map(v => (
            <VoucherCard
              key={v.id}
              voucher={v}
              onEdit={() => onEdit(v)}
              onDelete={() => onDelete(v.id)}
              onMarkUsed={() => onMarkUsed(v.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
