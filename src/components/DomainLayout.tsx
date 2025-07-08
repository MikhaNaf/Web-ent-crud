import { Outlet } from 'react-router-dom'

function DomainLayout() {
  return (
    <div className="absolute w-full bg-purple-400 dark:hidden min-h-75">
        <Outlet/>
    </div>
  )
}

export default DomainLayout