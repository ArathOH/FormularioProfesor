import { useState } from 'react'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
}

export default function PasswordField({ label, id, ...rest }: Props){
  const [show, setShow] = useState(false)
  return (
    <div className="grid gap-1">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      <div className="relative">
        <input
          id={id}
          type={show? 'text':'password'}
          className="w-full rounded-xl border px-3 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[var(--uabc-ochre)]"
          {...rest}
        />
        <button
          type="button"
          onClick={()=>setShow(s=>!s)}
          aria-label={show? 'Ocultar contraseña':'Mostrar contraseña'}
          className="absolute inset-y-0 right-2 my-auto text-sm underline"
        >{show? 'Ocultar':'Mostrar'}</button>
      </div>
    </div>
  )
}
