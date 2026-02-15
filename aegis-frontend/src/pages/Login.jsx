import React, { useState } from 'react'
import { auth } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  async function submit(e) {
    e.preventDefault(); setError(null)
    try {
      const res = await auth.login({ email, password })
      localStorage.setItem('aegis_token', res.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.body?.message || 'Login failed')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Institute email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" placeholder="you@iitmandi.ac.in" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" placeholder="••••••••" />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex items-center justify-between">
        <button className="bg-sky-600 text-white px-4 py-2 rounded hover:bg-sky-700">Sign in</button>
        <a className="text-sm text-slate-500 hover:underline cursor-pointer" onClick={() => navigate('/register')}>Create account</a>
      </div>
    </form>
  )
}
