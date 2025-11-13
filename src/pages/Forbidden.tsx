import { Link } from 'react-router-dom'

export default function Forbidden() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-[#007A33] mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Acceso Prohibido
        </h2>
        <p className="text-gray-600 mb-8">
          No tienes permisos para acceder a esta página.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-[#007A33] text-white rounded-lg hover:opacity-90 transition"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
