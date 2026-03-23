import Sidebar from "./Sidebar"

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="app">
      <Sidebar />
      <main className="main">{children}</main>
    </div>
  )
}

export default MainLayout
