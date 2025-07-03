import React from 'react'
import { Outlet } from 'react-router-dom'

function DomainLayout() {
  return (
    <div className="absolute w-full bg-blue-500 dark:hidden min-h-75">
        <Outlet/>
    </div>
  )
}

export default DomainLayout