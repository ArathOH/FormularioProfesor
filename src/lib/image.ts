export async function fileToBase64Resized(
  file: File,
  maxSize = 256,
  quality = 0.8
): Promise<string> {
  const img = await readFileToImage(file)
  const { w, h } = fitCover(img.width, img.height, maxSize, maxSize)

  const canvas = document.createElement('canvas')
  canvas.width = maxSize
  canvas.height = maxSize
  const ctx = canvas.getContext('2d')!

  // Limpiamos y centramos el recorte
  ctx.clearRect(0,0,maxSize,maxSize)
  const sx = (img.width - w) / 2
  const sy = (img.height - h) / 2
  ctx.drawImage(img, sx, sy, w, h, 0, 0, maxSize, maxSize)

  // Exportar JPEG base64
  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  // Opcional: validar tamaño
  const approxBytes = Math.ceil((dataUrl.length * 3) / 4)
  if (approxBytes > 200 * 1024) {
    // si supera ~200KB, bajar calidad
    return canvas.toDataURL('image/jpeg', 0.7)
  }
  return dataUrl
}

function readFileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer el archivo.'))
    reader.onload = () => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = () => reject(new Error('Imagen no válida.'))
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}

function fitCover(srcW:number, srcH:number, dstW:number, dstH:number){
  const r = Math.max(dstW/srcW, dstH/srcH)
  return { w: Math.round(srcW*r), h: Math.round(srcH*r) }
}
