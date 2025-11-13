import ProfileForm from '../components/ProfileForm'

export default function Profile(){
  return (
    <section className="max-w-3xl mx-auto grid gap-6">
      <header>
        <h1 className="text-2xl font-bold text-[#007A33]">Perfil</h1>
        <p className="text-sm text-slate-600">Actualiza tu información personal y tu foto.</p>
      </header>
      <ProfileForm />
    </section>
  )
}
