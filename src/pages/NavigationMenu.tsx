import { NavLink, useNavigate } from 'react-router-dom';
import supabase from '../utils/supabase'; // Sesuaikan path jika perlu
import styles from '../assets/css/NavigationMenu.module.css'; // Sesuaikan path jika perlu

const NavigationMenu = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/'); // Arahkan ke halaman login setelah logout
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.navLinks}>
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Dashboard
        </NavLink>
        <NavLink 
          to="/home" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Pendaftaran MK
        </NavLink>
        <NavLink 
          to="/mahasiswa" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Mahasiswa
        </NavLink>
        <NavLink 
          to="/dosen" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Dosen
        </NavLink>
        <NavLink 
          to="/kelas" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Kelas
        </NavLink>
        <NavLink 
          to="/matakuliah" 
          className={({ isActive }) => isActive ? `${styles.navLink} ${styles.active}` : styles.navLink}
        >
          Penjadwalan
        </NavLink>
      </div>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </nav>
  );
};

export default NavigationMenu;
