export const MAX_MB = 0.9
export const ALLOWED = ['image/jpeg','image/png','image/webp','image/gif','application/pdf']

export function fmtBytes(n:number){
  if(n < 1024) return `${n} B`
  const kb = n/1024; if(kb < 1024) return `${kb.toFixed(1)} KB`
  const mb = kb/1024; return `${mb.toFixed(2)} MB`
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
