import { useEffect, useState } from 'react';
import type { FormEvent, FC } from 'react';
import supabase from '../utils/supabase';// Pastikan path ini benar
import styles from '../assets/css/HomePage.module.css'; // Pastikan path ini benar

// --- Tipe Data (Tetap Sama) ---
interface Mahasiswa { id: number; nama_lengkap: string; }
interface MataKuliah { id: number; nama_mk: string; }

// Tipe untuk data gabungan (relasi)
interface AssignedModule {
  id: number;
  Mahasiswa: { id: number; nama_lengkap: string; } | null;
  Mata_Kuliah: { id: number; nama_mk: string; } | null;
}

// Komponen Notifikasi
interface Notification { message: string; type: 'success' | 'error'; }
const NotificationBanner: FC<{ notification: Notification | null }> = ({ notification }) => {
  if (!notification) return null;
  return <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>;
};

const HomePage = () => {
  // State tetap sama
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [matkulList, setMatkulList] = useState<MataKuliah[]>([]);
  const [assignedList, setAssignedList] = useState<AssignedModule[]>([]);
  
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>('');
  const [selectedMatkul, setSelectedMatkul] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  // Fungsi notifikasi tetap sama
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  // *** PERUBAHAN UTAMA ADA DI FUNGSI fetchData INI ***
  const fetchData = async () => {
    setLoading(true);

    // 1. Ambil semua data master dan data relasi secara terpisah
    const { data: mahasiswaData, error: mahasiswaError } = await supabase.from('Mahasiswa').select('*');
    const { data: matkulData, error: matkulError } = await supabase.from('Mata_Kuliah').select('*');
    const { data: relationsData, error: relationsError } = await supabase.from('mahasiswa_module').select('id, mahasiswa_id, matakuliah_id');

    if (mahasiswaError || matkulError || relationsError) {
      showNotification('Gagal memuat data dari server.', 'error');
      console.error({ mahasiswaError, matkulError, relationsError });
      setLoading(false);
      return;
    }
    
    // Simpan data master untuk dropdown
    setMahasiswaList(mahasiswaData || []);
    setMatkulList(matkulData || []);

    // 2. Gabungkan data secara manual di sini (Client-Side Join)
    const combinedData = relationsData.map(relation => {
      const mahasiswa = mahasiswaData.find(m => m.id === relation.mahasiswa_id);
      const matakuliah = matkulData.find(mk => mk.id === relation.matakuliah_id);

      return {
        id: relation.id,
        Mahasiswa: mahasiswa ? { id: mahasiswa.id, nama_lengkap: mahasiswa.nama_lengkap } : null,
        Mata_Kuliah: matakuliah ? { id: matakuliah.id, nama_mk: matakuliah.nama_mk } : null
      };
    });

    setAssignedList(combinedData);
    setLoading(false);
  };

  // Gunakan useEffect untuk memanggil fetchData
  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedMahasiswa || !selectedMatkul) {
      showNotification("Pilih mahasiswa dan mata kuliah terlebih dahulu!", "error");
      return;
    }
    
    const isDuplicate = assignedList.some(item =>
        item.Mahasiswa?.id === +selectedMahasiswa &&
        item.Mata_Kuliah?.id === +selectedMatkul
    );

    if (isDuplicate) {
      showNotification("Mahasiswa ini sudah terdaftar di mata kuliah tersebut.", "error");
      return;
    }
    
    const { error } = await supabase.from('mahasiswa_module').insert([{ 
      mahasiswa_id: selectedMahasiswa, 
      matakuliah_id: selectedMatkul 
    }]);

    if (error) {
      showNotification(error.message, 'error');
    } else {
      showNotification('Mahasiswa berhasil didaftarkan ke mata kuliah!', 'success');
      setSelectedMahasiswa('');
      setSelectedMatkul('');
      fetchData(); // Panggil ulang fetchData untuk refresh semua
    }
  };

  const handleDelete = async (assignedId: number): Promise<void> => {
    if (window.confirm("Yakin ingin menghapus pendaftaran ini?")) {
      const { error } = await supabase.from('mahasiswa_module').delete().eq('id', assignedId);
      if (error) {
        showNotification(error.message, 'error');
      } else {
        showNotification('Pendaftaran berhasil dihapus.', 'success');
        setAssignedList(assignedList.filter(item => item.id !== assignedId));
      }
    }
  };
  
  // Tampilan JSX tidak perlu diubah sama sekali
  return (
    <div className={styles.homePage}>
      <NotificationBanner notification={notification} />
      
      <div className={styles.formCard}>
        <h2>Daftarkan Mahasiswa ke Mata Kuliah</h2>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          <select value={selectedMahasiswa} onChange={(e) => setSelectedMahasiswa(e.target.value)} required>
            <option value="" disabled>Pilih Mahasiswa</option>
            {mahasiswaList.map(mhs => <option key={mhs.id} value={mhs.id}>{mhs.nama_lengkap}</option>)}
          </select>

          <select value={selectedMatkul} onChange={(e) => setSelectedMatkul(e.target.value)} required>
            <option value="" disabled>Pilih Mata Kuliah</option>
            {matkulList.map(mk => <option key={mk.id} value={mk.id}>{mk.nama_mk}</option>)}
          </select>
          
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Daftarkan</button>
        </form>
      </div>
      
      <div className={styles.listContainer}>
        <h2>Mahasiswa Terdaftar</h2>
        {loading ? (
          <div className={styles.loaderContainer}>Memuat data...</div>
        ) : (
          <table className={styles.listTable}>
            <thead>
              <tr>
                <th>Nama Mahasiswa</th>
                <th>Mata Kuliah yang Diambil</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {assignedList.length > 0 ? (
                assignedList.map((item) => (
                  <tr key={item.id}>
                    <td>{item.Mahasiswa?.nama_lengkap || 'N/A'}</td>
                    <td>{item.Mata_Kuliah?.nama_mk || 'N/A'}</td>
                    <td>
                      <button onClick={() => handleDelete(item.id)} className={`${styles.btn} ${styles.btnDelete}`}>Hapus</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={3} style={{ textAlign: 'center' }}>Belum ada data pendaftaran.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default HomePage;