import { Link } from 'react-router-dom'
import UsersTable from '../components/UsersTable'

export default function Home() {
  return (
    <section className="space-y-6">
      {/* Hero Section */}
      <div className="bg-linear-to-r from-(--uabc-green) to-(--uabc-ochre) text-white rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl md:text-4xl font-bold mb-2">Sistema de Gestión de Certificados</h1>
        <p className="text-lg opacity-90">Universidad Autónoma de Baja California</p>
        <p className="mt-4 text-sm opacity-80">
          Administra y consulta los certificados académicos de todos los usuarios del sistema
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link
          to="/certificates"
          className="group rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-(--uabc-green) transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-(--uabc-green)/10 p-3 group-hover:bg-(--uabc-green)/20 transition-colors">
              <svg className="h-6 w-6 text-(--uabc-green)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Subir Certificados</h3>
              <p className="text-sm text-slate-600">Agregar nuevos archivos</p>
            </div>
          </div>
        </Link>

        <Link
          to="/profile"
          className="group rounded-xl border-2 border-slate-200 bg-white p-6 hover:border-(--uabc-ochre) transition-all hover:shadow-lg"
        >
          <div className="flex items-center gap-4">
            <div className="rounded-full bg-(--uabc-ochre)/10 p-3 group-hover:bg-(--uabc-ochre)/20 transition-colors">
              <svg className="h-6 w-6 text-(--uabc-ochre)" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Mi Perfil</h3>
              <p className="text-sm text-slate-600">Ver información personal</p>
            </div>
          </div>
        </Link>

      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <UsersTable />
      </div>
    </section>
  )
}
