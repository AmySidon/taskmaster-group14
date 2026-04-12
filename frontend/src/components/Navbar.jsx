import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <h2>TaskMaster</h2>
      <div className="nav-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/">Logout</Link>
      </div>
    </nav>
  )
}

export default Navbar