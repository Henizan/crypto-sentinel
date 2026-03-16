import { NavLink, useNavigate } from "react-router-dom"

const Sidebar = () => {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <h2>CryptoSentinel AI</h2>

      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/sentinelles">Sentinelles</NavLink>
        <NavLink to="/config">Configuration</NavLink>
        <NavLink to="/profile">Profil</NavLink>
      </nav>

      <button className="logout" onClick={() => navigate("/login")}>
        Déconnexion
      </button>
    </aside>
  )
}

export default Sidebar
