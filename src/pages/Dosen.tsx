import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent, FC } from 'react';
import supabase from '../utils/supabase';
import styles from '../assets/css/DosenPage.module.css'; // Gunakan stylesheet yang sama atau baru

// Tipe Data untuk Dosen
interface Dosen {
  id: number;
  created_at: string;
  nidn: string;
  nama_lengkap: string;
  bidang_keahlian: string;
}
type DosenFormData = Omit<Dosen, 'id' | 'created_at'>;

// Komponen Notifikasi (bisa dibuat komponen terpisah nanti)
interface Notification {
  message: string;
  type: 'success' | 'error';
}
const NotificationBanner: FC<{ notification: Notification | null }> = ({ notification }) => {
  if (!notification) return null;
  return <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>;
};

const DosenPage = () => {
  const [dosenList, setDosenList] = useState<Dosen[]>([]);
  const [formData, setFormData] = useState<DosenFormData>({ nidn: '', nama_lengkap: '', bidang_keahlian: '' });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchDosen();
  }, []);

  const fetchDosen = async (): Promise<void> => {
    setLoading(true);
    const { data, error } = await supabase.from('Dosen').select('*').order('created_at', { ascending: false });
    if (error) {
      showNotification('Gagal memuat data dosen', 'error');
    } else {
      setDosenList(data as Dosen[]);
    }
    setLoading(false);
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.nidn || !formData.nama_lengkap || !formData.bidang_keahlian) {
      showNotification("Semua field harus diisi!", "error");
      return;
    }

    let error;
    if (editingId) {
      ({ error } = await supabase.from('Dosen').update(formData).eq('id', editingId));
      if (!error) showNotification('Data dosen berhasil diupdate!', 'success');
      setEditingId(null);
    } else {
      ({ error } = await supabase.from('Dosen').insert([formData]));
      if (!error) showNotification('Data dosen berhasil ditambahkan!', 'success');
    }

    if (error) {
      showNotification(error.message, 'error');
    } else {
      setFormData({ nidn: '', nama_lengkap: '', bidang_keahlian: '' });
      fetchDosen();
    }
  };
  
  const handleEditClick = (dosen: Dosen): void => {
    setEditingId(dosen.id);
    setFormData({ nidn: dosen.nidn, nama_lengkap: dosen.nama_lengkap, bidang_keahlian: dosen.bidang_keahlian });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = (): void => {
    setEditingId(null);
    setFormData({ nidn: '', nama_lengkap: '', bidang_keahlian: '' });
  };
  
  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm("Yakin ingin menghapus data dosen ini?")) {
      const { error } = await supabase.from('Dosen').delete().eq('id', id);
      if (error) {
        showNotification(error.message, 'error');
      } else {
        setDosenList(dosenList.filter(dosen => dosen.id !== id));
        showNotification('Data dosen berhasil dihapus.', 'success');
      }
    }
  };

  return (
    <div className={styles.dosenPage}>
      <NotificationBanner notification={notification} />
      
      <div className={styles.formCard}>
        <h2>{editingId ? 'Edit Dosen' : 'Tambah Dosen'}</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <input type="text" name="nidn" placeholder="NIDN" value={formData.nidn} onChange={handleInputChange} required />
            <input type="text" name="nama_lengkap" placeholder="Nama Lengkap" value={formData.nama_lengkap} onChange={handleInputChange} required />
          </div>
          <div className={styles.formGroup}>
            <input type="text" name="bidang_keahlian" placeholder="Bidang Keahlian" value={formData.bidang_keahlian} onChange={handleInputChange} required />
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
          {dosenList.map((dosen) => (
            <div key={dosen.id} className={styles.itemCard}>
              <h3>{dosen.nama_lengkap}</h3>
              <p>NIDN: {dosen.nidn} <br/> Keahlian: {dosen.bidang_keahlian}</p>
              <div className={styles.cardActions}>
                <button onClick={() => handleEditClick(dosen)} className={styles.cardBtn}>Edit</button>
                <button onClick={() => handleDelete(dosen.id)} className={`${styles.cardBtn} ${styles.delete}`}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DosenPage;