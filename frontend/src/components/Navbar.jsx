import '../css/Navbar.css'
import { Link, useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')

  return (
    <nav className="navbar">
      <h2 style={{ fontWeight: 'bold' }}>TaskMaster</h2>
      <div className="nav-links">
        {user.username && <span>Hi, {user.username}</span>}
        <Link to="/dashboard">Dashboard</Link>
        <button onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar