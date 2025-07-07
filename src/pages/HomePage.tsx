import { useEffect, useState } from 'react';
import type { FormEvent, FC } from 'react';
import supabase from '../utils/supabase';
import styles from '../assets/css/HomePage.module.css';

// --- Tipe Data ---
interface Mahasiswa {
  id: number;
  nama_lengkap: string;
  nim: string;
  jurusan: string;
  semester: string;
}
// Tipe untuk data jadwal yang digabungkan, ini yang akan kita gunakan untuk dropdown kedua
interface ScheduledCourse {
  id: number; // ID dari tabel module_class
  jam: string;
  Mata_Kuliah: { id: number; nama_mk: string; sks: number; } | null;
  Kelas: { id: number; nama_kelas: string; tahun_ajaran: string; semester: string | number; } | null;
}
// Tipe untuk data yang sudah terdaftar
interface AssignedModule {
  id: number;
  Mahasiswa: { nama_lengkap: string; } | null;
  Mata_Kuliah: { nama_mk: string; } | null;
}

// Komponen Notifikasi
interface Notification { message: string; type: 'success' | 'error'; }
const NotificationBanner: FC<{ notification: Notification | null }> = ({ notification }) => {
  if (!notification) return null;
  return <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>;
};

const HomePage = () => {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  const [scheduledList, setScheduledList] = useState<ScheduledCourse[]>([]);
  const [assignedList, setAssignedList] = useState<AssignedModule[]>([]);
  
  const [selectedMahasiswa, setSelectedMahasiswa] = useState<string>('');
  // Diubah untuk menyimpan ID dari jadwal (module_class), bukan matakuliah
  const [selectedSchedule, setSelectedSchedule] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = async () => {
    setLoading(true);
    // Ambil semua data yang dibutuhkan secara paralel
    const mahasiswaPromise = supabase.from('Mahasiswa').select('*');
    const schedulePromise = supabase.from('module_class').select(`id, jam, Mata_Kuliah(*), Kelas(*)`);
    const assignedPromise = supabase.from('mahasiswa_module').select(`id, Mahasiswa(nama_lengkap), Mata_Kuliah(nama_mk)`);

    const [mahasiswaRes, scheduleRes, assignedRes] = await Promise.all([mahasiswaPromise, schedulePromise, assignedPromise]);

    if (mahasiswaRes.error || scheduleRes.error || assignedRes.error) {
      showNotification('Gagal memuat data dari server.', 'error');
    } else {
      setMahasiswaList(mahasiswaRes.data || []);
      setScheduledList(scheduleRes.data as unknown as ScheduledCourse[]);
      setAssignedList(assignedRes.data as unknown as AssignedModule[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedMahasiswa || !selectedSchedule) {
      showNotification("Pilih mahasiswa dan jadwal kuliah terlebih dahulu!", "error");
      return;
    }

    // Ambil matakuliah_id dari jadwal yang dipilih
    const schedule = scheduledList.find(s => s.id === +selectedSchedule);
    const matakuliahId = schedule?.Mata_Kuliah?.id;

    if (!matakuliahId) {
      showNotification("Jadwal yang dipilih tidak valid.", "error");
      return;
    }

    const isDuplicate = assignedList.some(item =>
        item.Mahasiswa?.nama_lengkap === mahasiswaList.find(m => m.id === +selectedMahasiswa)?.nama_lengkap &&
        item.Mata_Kuliah?.nama_mk === schedule?.Mata_Kuliah?.nama_mk
    );

    if (isDuplicate) {
      showNotification("Mahasiswa ini sudah terdaftar di mata kuliah tersebut.", "error");
      return;
    }
    
    const { error } = await supabase.from('mahasiswa_module').insert([{ 
      mahasiswa_id: selectedMahasiswa, 
      matakuliah_id: matakuliahId
    }]);

    if (error) {
      showNotification(error.message, 'error');
    } else {
      showNotification('Mahasiswa berhasil didaftarkan ke mata kuliah!', 'success');
      setSelectedMahasiswa('');
      setSelectedSchedule('');
      fetchData();
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
  
  return (
    <div className={styles.homePage}>
      <NotificationBanner notification={notification} />
      
      <div className={styles.formCard}>
        <h2>Daftarkan Mahasiswa ke Mata Kuliah</h2>
        <form onSubmit={handleSubmit} className={styles.formGrid}>
          {/* Dropdown Mahasiswa dengan detail lengkap */}
          <select value={selectedMahasiswa} onChange={(e) => setSelectedMahasiswa(e.target.value)} required>
            <option value="" disabled>Pilih Mahasiswa</option>
            {mahasiswaList.map(mhs => (
              <option key={mhs.id} value={mhs.id}>
                {`${mhs.nama_lengkap} - ${mhs.nim} (Semester ${mhs.semester})`}
              </option>
            ))}
          </select>

          {/* Dropdown Jadwal Kuliah dengan detail lengkap */}
          <select value={selectedSchedule} onChange={(e) => setSelectedSchedule(e.target.value)} required>
            <option value="" disabled>Pilih Jadwal Kuliah</option>
            {scheduledList.map(schedule => (
              <option key={schedule.id} value={schedule.id}>
                {`${schedule.Mata_Kuliah?.nama_mk} - ${schedule.Kelas?.nama_kelas} (SKS: ${schedule.Mata_Kuliah?.sks}, Jadwal: ${schedule.jam})`}
              </option>
            ))}
          </select>
          
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Daftarkan</button>
        </form>
      </div>
      
      <div className={styles.listContainer}>
  <h2>Mahasiswa Terdaftar</h2>
  {loading ? (
    <div className={styles.loaderContainer}>Memuat data...</div>
  ) : (
    <div className={styles.enrollmentList}>
      {assignedList.length > 0 ? (
        assignedList.map((item) => (
          <div key={item.id} className={styles.enrollmentCard}>
            <div className={styles.enrollmentInfo}>
              <strong>{item.Mahasiswa?.nama_lengkap ?? 'N/A'}</strong>
              <span>{item.Mata_Kuliah?.nama_mk ?? 'N/A'}</span>
            </div>
            <button onClick={() => handleDelete(item.id)} className={`${styles.btn} ${styles.btnDelete}`}>
              Hapus
            </button>
          </div>
        ))
      ) : (
        <div className={styles.enrollmentCard}>
            <p>Belum ada data pendaftaran.</p>
        </div>
      )}
    </div>
  )}
</div>
    </div>
  );
};

export default HomePage;