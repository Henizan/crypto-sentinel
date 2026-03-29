import { NavLink, useNavigate } from "react-router-dom"
import logo from "../assets/Gemini_Generated_Image_bb0ezdbb0ezdbb0e-removebg-preview.png"

const Sidebar = () => {
  const navigate = useNavigate()

  return (
    <aside className="sidebar">
      <div
        onClick={() => navigate("/")}
        className="flex items-center gap-3 cursor-pointer mb-6 group"
      >
        <img
          src={logo}
          alt="CryptoSentinel AI"
          className="w-10 h-10 transition-transform duration-300 group-hover:scale-110 flex-shrink-0"
        />
        <span
          style={{ fontFamily: "'Orbitron', sans-serif" }}
          className="text-sm font-bold tracking-wide text-white/90 transition-colors duration-300 group-hover:text-blue-400 leading-tight"
        >
          Crypto<br />Sentinel AI
        </span>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent mb-4"></div>

      <nav>
        <NavLink to="/" end>Dashboard</NavLink>
        <NavLink to="/sentinelles">Sentinelles</NavLink>
        <NavLink to="/config">Configuration</NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
