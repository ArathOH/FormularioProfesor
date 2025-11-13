import { useState } from 'react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  id: string
}

export default function PasswordField({ label, id, ...rest }: Props){
  const [show, setShow] = useState(false)
  return (
    <div className="grid gap-1">
      {label && <label htmlFor={id} className="text-sm font-medium">{label}</label>}
      <div className="relative">
        <input
          id={id}
          type={show? 'text':'password'}
          className="w-full rounded-xl border-2 border-[#007A33]/30 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#CC8A00] focus:border-[#CC8A00] transition"
          {...rest}
        />
        <button
          type="button"
          onClick={()=>setShow(s=>!s)}
          aria-label={show? 'Ocultar contraseña':'Mostrar contraseña'}
          className="absolute inset-y-0 right-3 my-auto text-sm text-[#007A33] hover:text-[#CC8A00] font-medium transition"
        >{show? 'Ocultar':'Mostrar'}</button>
      </div>
    </div>
  )
}
