export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) {
    alert('No hay datos para exportar')
    return
  }

  // Obtener las cabeceras
  const headers = Object.keys(data[0])
  
  // Crear las filas CSV
  const csvRows = [
    headers.join(','), // Cabecera
    ...data.map(row => 
      headers.map(header => {
        const value = row[header]
        // Escapar comillas y comas
        const escaped = String(value || '').replace(/"/g, '""')
        return `"${escaped}"`
      }).join(',')
    )
  ]

  // Crear Blob y descargar
  const csvContent = csvRows.join('\n')
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
