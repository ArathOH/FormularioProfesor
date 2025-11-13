import { useAuth } from '../contexts/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()
  
  return (
    <section className="grid gap-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="rounded-xl border p-6">
        <h2 className="text-lg font-semibold mb-2">¡Bienvenido, {user?.displayName || 'Profesor'}!</h2>
        <p className="text-slate-600">Esta es tu aplicación de gestión de archivos con Cloudinary.</p>
        <p className="text-sm text-slate-500 mt-4">Ve a <strong>Archivos</strong> para subir y gestionar tus documentos.</p>
      </div>
    </section>
  )
}
