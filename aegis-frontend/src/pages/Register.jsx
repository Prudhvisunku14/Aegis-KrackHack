import React, { useState } from 'react'
import { auth } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const isValidEmail = email.toLowerCase().endsWith('@iitmandi.ac.in')

  async function submit(e) {
    e.preventDefault(); setError(null)
    if (!isValidEmail) {
      setError('Only @iitmandi.ac.in email addresses allowed')
      return
    }
    try {
      const res = await auth.register({ name, email, password })
      localStorage.setItem('aegis_token', res.token)
      navigate('/dashboard')
    } catch (err) {
      setError(err?.body?.message || 'Registration failed')
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700">Full name</label>
        <input value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" placeholder="Your name" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Institute email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" placeholder="you@iitmandi.ac.in" />
        {email && !isValidEmail && <p className="text-xs text-red-600 mt-1">Only @iitmandi.ac.in addresses allowed</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700">Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2" placeholder="Choose a password" />
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex items-center justify-between">
        <button disabled={!isValidEmail || !name || !password} className={`text-white px-4 py-2 rounded ${isValidEmail && name && password ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'}`}>Create account</button>
        <a className="text-sm text-slate-500 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Already have an account?</a>
      </div>
    </form>
  )
}
