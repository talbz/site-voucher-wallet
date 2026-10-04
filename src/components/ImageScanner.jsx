import { useRef, useState } from 'react'
import { Camera, Upload, Loader2, X } from 'lucide-react'

const SUPPORTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export default function ImageScanner({ onResult, onError }) {
  const fileRef = useRef(null)
  const cameraRef = useRef(null)
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState(null)

  async function processFile(file) {
    if (!SUPPORTED_TYPES.includes(file.type)) {
      onError('פורמט לא נתמך. אנא השתמש ב-JPG, PNG, WEBP, או GIF')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      onError('התמונה גדולה מדי (מקסימום 5MB)')
      return
    }

    const reader = new FileReader()
    reader.onload = async (e) => {
      const dataUrl = e.target.result
      setPreview(dataUrl)
      setScanning(true)

      // Extract base64 data (strip the data:image/...;base64, prefix)
      const base64 = dataUrl.split(',')[1]
      const mediaType = file.type

      try {
        const res = await fetch('/api/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, mediaType }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'שגיאה בסריקה')
        onResult(data)
      } catch (err) {
        onError(err.message || 'שגיאה בסריקה, נסה שוב')
      } finally {
        setScanning(false)
        setPreview(null)
      }
    }
    reader.readAsDataURL(file)
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <div className="mb-4">
      {/* Preview overlay */}
      {scanning && preview && (
        <div className="relative mb-3 rounded-xl overflow-hidden border border-blue-100">
          <img src={preview} alt="סריקה" className="w-full max-h-40 object-contain bg-gray-50" />
          <div className="absolute inset-0 bg-blue-600/30 flex flex-col items-center justify-center gap-2">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <span className="text-white font-medium text-sm">מנתח תמונה...</span>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-500 mb-2 text-center">סרוק תמונה של השובר למילוי אוטומטי</p>
      <div className="flex gap-2">
        {/* Camera capture (mobile) */}
        <button
          type="button"
          onClick={() => cameraRef.current?.click()}
          disabled={scanning}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 rounded-xl py-2.5 text-sm text-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
        >
          <Camera className="w-4 h-4" />
          צלם
        </button>
        {/* File upload */}
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={scanning}
          className="flex-1 flex items-center justify-center gap-2 border-2 border-dashed border-blue-200 rounded-xl py-2.5 text-sm text-blue-500 hover:bg-blue-50 transition disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          העלה תמונה
        </button>
      </div>

      {/* Hidden inputs */}
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
