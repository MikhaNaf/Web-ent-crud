import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, FC } from 'react';
import supabase from '../utils/supabase';
import styles from '../assets/css/MataKuliahPage.module.css'; // Path ke file CSS

// Tipe Data untuk Mata Kuliah
interface MataKuliah {
  id: number;
  created_at: string;
  kode_mk: string;
  nama_mk: string;
  sks: number;
}
type MataKuliahFormData = Omit<MataKuliah, 'id' | 'created_at'>;

// Komponen Notifikasi
interface Notification {
  message: string;
  type: 'success' | 'error';
}
const NotificationBanner: FC<{ notification: Notification | null }> = ({ notification }) => {
  if (!notification) return null;
  return <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>;
};

const MataKuliahPage = () => {
  const [matkulList, setMatkulList] = useState<MataKuliah[]>([]);
  const [formData, setFormData] = useState<MataKuliahFormData>({ kode_mk: '', nama_mk: '', sks: 0 });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchMataKuliah();
  }, []);

  const fetchMataKuliah = async (): Promise<void> => {
    setLoading(true);
    // Pastikan nama tabel di Supabase adalah 'Mata_Kuliah'
    const { data, error } = await supabase.from('Mata_Kuliah').select('*').order('created_at', { ascending: false });
    if (error) {
      showNotification('Gagal memuat data mata kuliah', 'error');
    } else {
      setMatkulList(data as MataKuliah[]);
    }
    setLoading(false);
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type } = e.target;
    // Konversi ke angka jika tipenya number (untuk SKS)
    const val = type === 'number' ? parseInt(value, 10) || 0 : value;
    setFormData({ ...formData, [name]: val });
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.kode_mk || !formData.nama_mk || formData.sks <= 0) {
      showNotification("Semua field harus diisi dan SKS harus lebih dari 0!", "error");
      return;
    }

    let error;
    if (editingId) {
      ({ error } = await supabase.from('Mata_Kuliah').update(formData).eq('id', editingId));
      if (!error) showNotification('Data mata kuliah berhasil diupdate!', 'success');
      setEditingId(null);
    } else {
      ({ error } = await supabase.from('Mata_Kuliah').insert([formData]));
      if (!error) showNotification('Data mata kuliah berhasil ditambahkan!', 'success');
    }

    if (error) {
      showNotification(error.message, 'error');
    } else {
      setFormData({ kode_mk: '', nama_mk: '', sks: 0 });
      fetchMataKuliah();
    }
  };
  
  const handleEditClick = (matkul: MataKuliah): void => {
    setEditingId(matkul.id);
    setFormData({ kode_mk: matkul.kode_mk, nama_mk: matkul.nama_mk, sks: matkul.sks });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setFormData({ kode_mk: '', nama_mk: '', sks: 0 });
  };
  
  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm("Yakin ingin menghapus data mata kuliah ini?")) {
      const { error } = await supabase.from('Mata_Kuliah').delete().eq('id', id);
      if (error) {
        showNotification(error.message, 'error');
      } else {
        setMatkulList(matkulList.filter(matkul => matkul.id !== id));
        showNotification('Data mata kuliah berhasil dihapus.', 'success');
      }
    }
  };

  return (
    <div className={styles.matakuliahPage}>
      <NotificationBanner notification={notification} />
      
      <div className={styles.formCard}>
        <h2>{editingId ? 'Edit Mata Kuliah' : 'Tambah Mata Kuliah Baru'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input type="text" name="kode_mk" placeholder="Kode Mata Kuliah" value={formData.kode_mk} onChange={handleInputChange} required />
            <input type="text" name="nama_mk" placeholder="Nama Mata Kuliah" value={formData.nama_mk} onChange={handleInputChange} required />
          </div>
          <div className={styles.formGroup}>
            <input type="number" name="sks" placeholder="Jumlah SKS" value={formData.sks} onChange={handleInputChange} required />
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
          {matkulList.map((matkul) => (
            <div key={matkul.id} className={styles.itemCard}>
              <h3>{matkul.nama_mk}</h3>
              <p>Kode: {matkul.kode_mk} <br/> SKS: {matkul.sks}</p>
              <div className={styles.cardActions}>
                <button onClick={() => handleEditClick(matkul)} className={styles.cardBtn}>Edit</button>
                <button onClick={() => handleDelete(matkul.id)} className={`${styles.cardBtn} ${styles.delete}`}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MataKuliahPage;