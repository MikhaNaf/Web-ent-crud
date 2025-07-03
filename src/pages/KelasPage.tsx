import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, FC } from 'react';
import supabase from '../utils/supabase';
import styles from '../assets/css/KelasPage.module.css'; // Path ke file CSS

// Tipe Data untuk Kelas
interface Kelas {
  id: number;
  created_at: string;
  nama_kelas: string;
  tahun_ajaran: string;
  semester: string; // Menggunakan string untuk fleksibilitas
}
type KelasFormData = Omit<Kelas, 'id' | 'created_at'>;

// Komponen Notifikasi
interface Notification {
  message: string;
  type: 'success' | 'error';
}
const NotificationBanner: FC<{ notification: Notification | null }> = ({ notification }) => {
  if (!notification) return null;
  return <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>;
};

const KelasPage = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [formData, setFormData] = useState<KelasFormData>({ nama_kelas: '', tahun_ajaran: '', semester: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  const fetchKelas = async (): Promise<void> => {
    setLoading(true);
    const { data, error } = await supabase.from('Kelas').select('*').order('created_at', { ascending: false });
    if (error) {
      showNotification('Gagal memuat data kelas', 'error');
    } else {
      setKelasList(data as Kelas[]);
    }
    setLoading(false);
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.nama_kelas || !formData.tahun_ajaran || !formData.semester) {
      showNotification("Semua field harus diisi!", "error");
      return;
    }

    let error;
    if (editingId) {
      ({ error } = await supabase.from('Kelas').update(formData).eq('id', editingId));
      if (!error) showNotification('Data kelas berhasil diupdate!', 'success');
      setEditingId(null);
    } else {
      ({ error } = await supabase.from('Kelas').insert([formData]));
      if (!error) showNotification('Data kelas berhasil ditambahkan!', 'success');
    }

    if (error) {
      showNotification(error.message, 'error');
    } else {
      setFormData({ nama_kelas: '', tahun_ajaran: '', semester: '' });
      fetchKelas();
    }
  };
  
  const handleEditClick = (kelas: Kelas): void => {
    setEditingId(kelas.id);
    setFormData({ nama_kelas: kelas.nama_kelas, tahun_ajaran: kelas.tahun_ajaran, semester: kelas.semester });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setFormData({ nama_kelas: '', tahun_ajaran: '', semester: '' });
  };
  
  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm("Yakin ingin menghapus data kelas ini?")) {
      const { error } = await supabase.from('Kelas').delete().eq('id', id);
      if (error) {
        showNotification(error.message, 'error');
      } else {
        setKelasList(kelasList.filter(kelas => kelas.id !== id));
        showNotification('Data kelas berhasil dihapus.', 'success');
      }
    }
  };

  return (
    <div className={styles.kelasPage}>
      <NotificationBanner notification={notification} />
      
      <div className={styles.formCard}>
        <h2>{editingId ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input type="text" name="nama_kelas" placeholder="Nama Kelas (Contoh: SI-401)" value={formData.nama_kelas} onChange={handleInputChange} required />
            <input type="text" name="tahun_ajaran" placeholder="Tahun Ajaran (Contoh: 2024/2025)" value={formData.tahun_ajaran} onChange={handleInputChange} required />
          </div>
          <div className={styles.formGroup}>
            <input type="text" name="semester" placeholder="Semester (Contoh: Ganjil)" value={formData.semester} onChange={handleInputChange} required />
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
        <div className={styles.itemGrid}>
          {kelasList.map((kelas) => (
            <div key={kelas.id} className={styles.itemCard}>
              <h3>{kelas.nama_kelas}</h3>
              <p>Tahun Ajaran: {kelas.tahun_ajaran} <br/> Semester: {kelas.semester}</p>
              <div className={styles.cardActions}>
                <button onClick={() => handleEditClick(kelas)} className={styles.cardBtn}>Edit</button>
                <button onClick={() => handleDelete(kelas.id)} className={`${styles.cardBtn} ${styles.delete}`}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KelasPage;