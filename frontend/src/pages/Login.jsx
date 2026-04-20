import '../css/Login.css'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { loginUser } from '../api'

function Login() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await loginUser(formData.email, formData.password)
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
  <div className="login-page">
    <div className="login-card">
      <h1 className="logo">TaskMaster</h1>
      <h2>Welcome Back</h2>

      {error && <p className="error">{error}</p>}

      <form onSubmit={handleSubmit} className="login-form">
        <input
          type="email"
          name="email"
          placeholder="Email address"
          value={formData.email}
          onChange={handleChange}
          required
        />

        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <p className="register-link">
        Don’t have an account? <Link to="/register">Register</Link>
      </p>
    </div>
  </div>
)
}

export default Login