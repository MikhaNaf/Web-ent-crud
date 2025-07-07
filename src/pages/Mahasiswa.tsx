import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, FC } from 'react';
import supabase from '../utils/supabase';
import styles from '../assets/css/MahasiswaPage.module.css';

// 1. Tambahkan 'semester' pada Tipe Data
interface Mahasiswa {
  id: number;
  created_at: string;
  nim: string;
  nama_lengkap: string;
  jurusan: string;
  semester: string; // <-- Ditambahkan
}
type MahasiswaFormData = Omit<Mahasiswa, 'id' | 'created_at'>;

// Komponen Notifikasi
interface Notification {
  message: string;
  type: 'success' | 'error';
}
const NotificationBanner: FC<{ notification: Notification | null }> = ({ notification }) => {
  if (!notification) return null;
  return <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>;
};

const MahasiswaPage = () => {
  const [mahasiswaList, setMahasiswaList] = useState<Mahasiswa[]>([]);
  // 2. Tambahkan 'semester' ke state formData
  const [formData, setFormData] = useState<MahasiswaFormData>({ nim: '', nama_lengkap: '', jurusan: '', semester: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);
  
  // Opsi untuk dropdown semester
  const semesterOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    fetchMahasiswa();
  }, []);

  const fetchMahasiswa = async (): Promise<void> => {
    setLoading(true);
    const { data, error } = await supabase.from('Mahasiswa').select('*').order('created_at', { ascending: false });
    if (error) {
      showNotification('Gagal memuat data', 'error');
    } else {
      setMahasiswaList(data as Mahasiswa[]);
    }
    setLoading(false);
  };
  
  // Dibuat agar bisa menangani input dan select
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    // 3. Tambahkan validasi untuk semester
    if (!formData.nim || !formData.nama_lengkap || !formData.jurusan || !formData.semester) {
      showNotification("Semua field harus diisi!", "error");
      return;
    }

    let error;
    if (editingId) {
      ({ error } = await supabase.from('Mahasiswa').update(formData).eq('id', editingId));
      if (!error) showNotification('Data berhasil diupdate!', 'success');
      setEditingId(null);
    } else {
      ({ error } = await supabase.from('Mahasiswa').insert([formData]));
      if (!error) showNotification('Data mahasiswa berhasil ditambahkan!', 'success');
    }

    if (error) {
      showNotification(error.message, 'error');
    } else {
      setFormData({ nim: '', nama_lengkap: '', jurusan: '', semester: '' }); // Reset form
      fetchMahasiswa();
    }
  };
  
  const handleEditClick = (mhs: Mahasiswa): void => {
    setEditingId(mhs.id);
    setFormData({ nim: mhs.nim, nama_lengkap: mhs.nama_lengkap, jurusan: mhs.jurusan, semester: mhs.semester });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setFormData({ nim: '', nama_lengkap: '', jurusan: '', semester: '' });
  };
  
  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm("Yakin ingin menghapus data ini?")) {
      const { error } = await supabase.from('Mahasiswa').delete().eq('id', id);
      if (error) {
        showNotification(error.message, 'error');
      } else {
        setMahasiswaList(mahasiswaList.filter(mhs => mhs.id !== id));
        showNotification('Data berhasil dihapus.', 'success');
      }
    }
  };

  return (
    <div className={styles.mahasiswaPage}>
      <NotificationBanner notification={notification} />
      
      <div className={styles.formCard}>
        <h2>{editingId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input type="text" name="nim" placeholder="NIM" value={formData.nim} onChange={handleFormChange} required />
            <input type="text" name="nama_lengkap" placeholder="Nama Lengkap" value={formData.nama_lengkap} onChange={handleFormChange} required />
          </div>
          <div className={styles.formGroup}>
            <input type="text" name="jurusan" placeholder="Jurusan" value={formData.jurusan} onChange={handleFormChange} required />
            {/* 4. Tambahkan dropdown semester di form */}
            <select name="semester" value={formData.semester} onChange={handleFormChange} required>
              <option value="" disabled>Pilih Semester</option>
              {semesterOptions.map(option => <option key={option} value={option}>{`Semester ${option}`}</option>)}
            </select>
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              {editingId ? 'Update Data' : 'Tambah Data'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className={`${styles.btn} ${styles.btnSecondary}`}>
                Batal
              </button>
            )}
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className={styles.loaderContainer}>Memuat data...</div>
      ) : (
        <div className={styles.mahasiswaGrid}>
          {mahasiswaList.map((mhs) => (
            <div key={mhs.id} className={styles.mahasiswaCard}>
              <h3>{mhs.nama_lengkap}</h3>
              {/* 5. Tampilkan semester di kartu */}
              <p>
                NIM: {mhs.nim} <br/>
                Jurusan: {mhs.jurusan} <br/>
                Semester: {mhs.semester}
              </p>
              <div className={styles.cardActions}>
                <button onClick={() => handleEditClick(mhs)} className={styles.cardBtn}>Edit</button>
                <button onClick={() => handleDelete(mhs.id)} className={`${styles.cardBtn} ${styles.delete}`}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MahasiswaPage;