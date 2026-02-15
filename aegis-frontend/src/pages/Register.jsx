import React, { useState } from 'react'
import { auth } from '../services/api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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
        <div className="relative">
          <input type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full border rounded px-3 py-2 pr-10" placeholder="Choose a password" />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-slate-500 hover:text-slate-700">
            {showPassword ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
            ) : (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clipRule="evenodd" /><path d="M15.171 13.576l1.474 1.474a1 1 0 001.414-1.414l-1.473-1.473A10.017 10.017 0 0019.542 10c-1.274-4.057-5.064-7-9.542-7a9.958 9.958 0 00-4.512 1.074l-1.78-1.781a1 1 0 00-1.414 1.414l14 14z" /></svg>
            )}
          </button>
        </div>
      </div>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="flex items-center justify-between">
        <button disabled={!isValidEmail || !name || !password} className={`text-white px-4 py-2 rounded ${isValidEmail && name && password ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-gray-400 cursor-not-allowed'}`}>Create account</button>
        <a className="text-sm text-slate-500 hover:underline cursor-pointer" onClick={() => navigate('/login')}>Already have an account?</a>
      </div>
    </form>
  )
}
