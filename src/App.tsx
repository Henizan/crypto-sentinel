import { Routes, Route } from "react-router-dom"
import MainLayout from "./layout/MainLayout"
import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Sentinelles from "./pages/Sentinelles"
import Config from "./pages/Config"
import Profile from "./pages/Profile"

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      <Route
        path="/*"
        element={
          <MainLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/sentinelles" element={<Sentinelles />} />
              <Route path="/config" element={<Config />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </MainLayout>
        }
      />
    </Routes>
  )
}

export default App
