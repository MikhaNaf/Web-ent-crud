import { BrowserRouter, Route, Routes } from "react-router-dom"
import Layout from "./components/Layout"
import UserRegister from "./pages/UserRegister"
import Login from "./pages/Login"
import DomainLayout from "./components/DomainLayout"
import Mahasiswa from "./pages/Mahasiswa"
import Dosen from "./pages/Dosen"
import KelasPage from "./pages/KelasPage"
import MataKuliahPage from "./pages/MataKuliahPage"
import HomePage from "./pages/HomePage"

function App() {

  return (
    <BrowserRouter>
      <Routes >
        <Route element={<Layout />}>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/home" element={<HomePage/>} />
        </Route>
        <Route element={<DomainLayout/>}>
          <Route path="/mahasiswa" element={<Mahasiswa/>} />
          <Route path="/matakuliah" element={<MataKuliahPage/>} />
          <Route path="/kelas" element={<KelasPage/>} />
          <Route path="/dosen" element={<Dosen/>} />
        </Route>
      </Routes>
    </BrowserRouter>     
  )
}

export default App