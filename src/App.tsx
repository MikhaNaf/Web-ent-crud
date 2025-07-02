import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import UserRegister from "./pages/UserRegister"
import Login from "./pages/Login"
import Home from "./pages/Home"
import DashboardLayout from "./components/DashboardLayout"

function App() {

  return (
    <BrowserRouter>
      <Routes >
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/home" element={<Home />} />
        </Route>
        <Route element={<DashboardLayout />}>
          <Route path="/home" element={<Home />} />
        </Route>
      </Routes>
    </BrowserRouter>     
  )
}

export default App