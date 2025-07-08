import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

// Halaman
import UserRegister from "./pages/UserRegister";
import Login from "./pages/Login";
import MahasiswaPage from "./pages/Mahasiswa";// Pastikan nama file dan komponen benar
import DosenPage from "./pages/Dosen";
import KelasPage from "./pages/KelasPage";
import MataKuliahPage from "./pages/MataKuliahPage";
import HomePage from "./pages/HomePage";
import DashboardPage from "./pages/DashboardPage";
import NavigationMenu from "./pages/NavigationMenu";

/**
 * Komponen Layout untuk halaman yang memerlukan menu navigasi.
 * <Outlet /> akan merender komponen halaman anak (misal: DashboardPage, HomePage).
 */
const DashboardLayout = () => (
  <>
    <NavigationMenu />
    <Outlet />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rute publik tanpa menu navigasi */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<UserRegister />} />

        {/* Grup rute privat yang menggunakan layout dengan menu navigasi */}
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/home" element={<HomePage />} />
          <Route path="/mahasiswa" element={<MahasiswaPage/>} />
          <Route path="/matakuliah" element={<MataKuliahPage />} />
          <Route path="/kelas" element={<KelasPage />} />
          <Route path="/dosen" element={<DosenPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
