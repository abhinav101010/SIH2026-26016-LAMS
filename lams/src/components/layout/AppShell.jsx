import { useState, useContext } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'
import { AuthContext } from '../../auth/AuthContext'

const AppShell = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useContext(AuthContext)

  return (
    <div className="flex h-screen bg-transparent">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <Header user={user} />
        <main
          className={`
            flex-1 overflow-auto
            transition-all duration-300
            ${collapsed ? 'ml-0' : 'ml-0'}
          `}
        >
          <div className="p-6 max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export default AppShell
