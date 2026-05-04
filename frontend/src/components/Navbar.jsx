import '../css/Navbar.css'
import { useNavigate } from 'react-router-dom'

function Navbar() {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const initials = user.username ? user.username.slice(0, 2).toUpperCase() : '?'

  return (
    <nav className="navbar">
      <span className="navbar-brand">TaskMaster</span>
      <div className="nav-right">
        {user.username && (
          <div className="nav-user">
            <div className="avatar">{initials}</div>
            <span className="nav-username">{user.username}</span>
          </div>
        )}
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  )
}

export default Navbar