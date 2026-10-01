import { useState, useEffect } from 'react'
import Header from './components/Header'
import BalanceSummary from './components/BalanceSummary'
import VoucherList from './components/VoucherList'
import AddVoucherModal from './components/AddVoucherModal'

const STORAGE_KEY = 'voucher-wallet-data'

const SAMPLE_DATA = [
  { id: 1, store: 'אמזון', code: 'AMZ-2024-XKJH', amount: 250, currency: '₪', type: 'voucher', status: 'active', expiry: '2025-06-30', notes: 'קרדיט מהחזר' },
  { id: 2, store: 'זארה', code: 'ZARA-RF-88821', amount: 180, currency: '₪', type: 'refund', status: 'active', expiry: '2025-03-15', notes: 'החזרת ג\'קט' },
  { id: 3, store: 'H&M', code: 'HM-GIFT-44ABC', amount: 100, currency: '₪', type: 'gift', status: 'active', expiry: '2026-12-31', notes: 'כרטיס מתנה ליום הולדת' },
  { id: 4, store: 'KSP', code: 'KSP-STORE-991', amount: 320, currency: '₪', type: 'voucher', status: 'used', expiry: '2024-08-01', notes: 'נוצל' },
  { id: 5, store: 'ASOS', code: 'ASOS-15OFF-2024', amount: 75, currency: '₪', type: 'coupon', status: 'active', expiry: '2025-01-20', notes: '15% הנחה' },
]

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {}
  return SAMPLE_DATA
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch {}
}

export default function App() {
  const [vouchers, setVouchers] = useState(loadData)
  const [showAdd, setShowAdd] = useState(false)
  const [editVoucher, setEditVoucher] = useState(null)
  const [filter, setFilter] = useState('active')

  useEffect(() => {
    saveData(vouchers)
  }, [vouchers])

  function addVoucher(v) {
    const newV = { ...v, id: Date.now() }
    setVouchers(prev => [newV, ...prev])
    setShowAdd(false)
  }

  function updateVoucher(v) {
    setVouchers(prev => prev.map(x => x.id === v.id ? v : x))
    setEditVoucher(null)
  }

  function deleteVoucher(id) {
    setVouchers(prev => prev.filter(x => x.id !== id))
  }

  function markUsed(id) {
    setVouchers(prev => prev.map(x => x.id === id ? { ...x, status: 'used' } : x))
  }

  const activeVouchers = vouchers.filter(v => v.status === 'active')
  const totalBalance = activeVouchers.reduce((sum, v) => sum + (v.amount || 0), 0)
  const filtered = filter === 'all' ? vouchers : vouchers.filter(v => v.status === filter)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50">
      <Header onAdd={() => setShowAdd(true)} />
      <main className="max-w-2xl mx-auto px-4 pb-12">
        <BalanceSummary vouchers={vouchers} totalBalance={totalBalance} />
        <VoucherList
          vouchers={filtered}
          filter={filter}
          onFilterChange={setFilter}
          onEdit={setEditVoucher}
          onDelete={deleteVoucher}
          onMarkUsed={markUsed}
        />
      </main>
      {(showAdd || editVoucher) && (
        <AddVoucherModal
          initial={editVoucher}
          onSave={editVoucher ? updateVoucher : addVoucher}
          onClose={() => { setShowAdd(false); setEditVoucher(null) }}
        />
      )}
    </div>
  )
}
