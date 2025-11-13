import type { UploadItem } from '../lib/types'

export default function FileCard({ item, onRequestDelete }: { item: UploadItem; onRequestDelete: (item: UploadItem)=>void }){
  const isImg = item.contentType.startsWith('image/')
  const isPdf = item.contentType === 'application/pdf'

  return (
    <article className="rounded-2xl border overflow-hidden bg-white">
      <div className="aspect-video bg-slate-50 grid place-items-center overflow-hidden">
        {isImg ? (
          <img src={item.data} alt={item.name} className="h-full w-full object-cover" />
        ) : isPdf ? (
          <div className="grid place-items-center text-center p-6">
            <div className="h-12 w-12 rounded-lg grid place-items-center bg-[var(--uabc-green)]/10 text-[var(--uabc-green)] mx-auto">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 2h9l5 5v15a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"/><path d="M14 2v6h6"/></svg>
            </div>
            <p className="mt-2 text-sm font-medium">PDF</p>
          </div>
        ) : (
          <div className="p-6 text-sm text-slate-500">Sin vista previa</div>
        )}
      </div>
      <div className="p-3">
        <p className="font-medium truncate" title={item.name}>{item.name}</p>
        <p className="text-xs text-slate-500 truncate">{item.contentType}</p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <a href={item.data} target="_blank" rel="noreferrer" download={item.name} className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm bg-[var(--uabc-green)] text-white hover:bg-[var(--uabc-ochre)]">Abrir</a>
          <button onClick={()=>onRequestDelete(item)} className="inline-flex items-center rounded-lg px-3 py-1.5 text-sm border hover:border-[var(--uabc-ochre)]">Eliminar</button>
        </div>
      </div>
    </article>
  )
}
