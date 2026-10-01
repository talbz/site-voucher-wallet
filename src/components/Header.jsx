import { Wallet, Plus } from 'lucide-react'

export default function Header({ onAdd }) {
  return (
    <header className="bg-blue-600 text-white shadow-lg mb-6">
      <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wallet className="w-7 h-7" />
          <h1 className="text-xl font-bold">ארנק קופונים</h1>
        </div>
        <button
          onClick={onAdd}
          className="flex items-center gap-1 bg-white text-blue-600 font-semibold px-4 py-2 rounded-full text-sm hover:bg-blue-50 transition"
        >
          <Plus className="w-4 h-4" />
          הוסף
        </button>
      </div>
    </header>
  )
}
