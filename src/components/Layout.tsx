import { Outlet } from "react-router-dom";

export default function Layout() {
    return (
    <div className="m-0 font-sans antialiased font-normal bg-fuchsia-400 text-start text-base leading-default text-slate-500">
        <Outlet/>
    </div>    
    )
}