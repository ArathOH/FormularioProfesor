import { useRef, useState } from 'react'
import { fileToBase64Resized } from '../lib/image'

const ALLOWED = ['image/jpeg','image/png','image/webp']
const MAX_RAW_MB = 5

export default function AvatarB64Uploader({ value, onChange }:{ value?: string; onChange: (b64: string)=>void }){
  const [err, setErr] = useState<string|undefined>()
  const inputRef = useRef<HTMLInputElement>(null)

  const pick = () => inputRef.current?.click()

  const onFile = async (f?: File) => {
    setErr(undefined)
    if(!f) return
    if(!ALLOWED.includes(f.type)) { setErr('Formatos permitidos: JPG, PNG, WebP'); return }
    if(f.size > MAX_RAW_MB*1024*1024){ setErr(`Máximo ${MAX_RAW_MB}MB`); return }
    try{
      const b64 = await fileToBase64Resized(f, 256, 0.8)
      onChange(b64)
    }catch{ setErr('No se pudo procesar la imagen') }
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center gap-3">
        <div className="h-20 w-20 rounded-full overflow-hidden bg-slate-200">
          {value ? <img src={value} alt="Avatar" className="h-full w-full object-cover"/> : null}
        </div>
        <div className="grid gap-2">
          <button type="button" onClick={pick} className="rounded-xl bg-[#007A33] text-white px-3 py-1.5 hover:bg-[#CC8A00] focus:outline-none focus:ring-2 focus:ring-(--uabc-ochre)">Cambiar foto</button>
          <input ref={inputRef} type="file" accept="image/*" hidden onChange={(e)=>onFile(e.target.files?.[0])}/>
          <p className="text-xs text-slate-500">Recomendado: 256×256, &lt; 200 KB</p>
          {err && <p className="text-xs text-red-600">{err}</p>}
        </div>
      </div>
    </div>
  )
}
