import { useEffect } from 'react'

export default function DeleteModal({ open, fileName, onCancel, onConfirm }:{ open:boolean; fileName:string; onCancel:()=>void; onConfirm:()=>void }){
  useEffect(()=>{
    const onKey=(e:KeyboardEvent)=>{ if(e.key==='Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return ()=> document.removeEventListener('keydown', onKey)
  },[onCancel])

  if(!open) return null
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30">
      <div className="w-full max-w-md rounded-2xl bg-white border shadow p-6">
        <h2 className="text-lg font-semibold">¿Eliminar certificado?</h2>
        <p className="mt-1 text-sm text-slate-600">Se eliminará de tu listado.</p>
        <p className="mt-2 text-sm"><span className="font-medium">Archivo:</span> {fileName}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-lg border px-4 py-2">Cancelar</button>
          <button onClick={onConfirm} className="rounded-lg px-4 py-2 bg-red-600 text-white hover:bg-red-700">Eliminar</button>
        </div>
      </div>
    </div>
  )
}
