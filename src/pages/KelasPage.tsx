import { useEffect, useState,} from 'react';
import type { ChangeEvent, FormEvent, FC } from 'react';
import supabase from '../utils/supabase';
import styles from '../assets/css/KelasPage.module.css';

// Tipe Data
interface MataKuliah { id: number; nama_mk: string; } // Diperlukan untuk dropdown
interface Kelas {
  id: number;
  created_at: string;
  nama_kelas: string;
  tahun_ajaran: string;
  semester: string;
  module_class: {
    Mata_Kuliah: {
      nama_mk: string;
    } | null;
  }[];
}
type KelasFormData = Omit<Kelas, 'id' | 'created_at' | 'module_class'>;

// Komponen Notifikasi
interface Notification { message: string; type: 'success' | 'error'; }
const NotificationBanner: FC<{ notification: Notification | null }> = ({ notification }) => {
  if (!notification) return null;
  return <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>;
};

const KelasPage = () => {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [matkulList, setMatkulList] = useState<MataKuliah[]>([]); // State untuk daftar mata kuliah
  const [formData, setFormData] = useState<KelasFormData>({ nama_kelas: '', tahun_ajaran: '', semester: '' });
  
  // State untuk mengelola form tambah mata kuliah di dalam kartu
  const [addCourseToClassId, setAddCourseToClassId] = useState<number | null>(null);
  const [selectedCourseForAdding, setSelectedCourseForAdding] = useState<string>('');

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    // Ambil data kelas, mata kuliah, dan relasinya
    const kelasPromise = supabase.from('Kelas').select(`*, module_class(Mata_Kuliah(nama_mk))`).order('created_at', { ascending: false });
    const matkulPromise = supabase.from('Mata_Kuliah').select('*');

    const [kelasRes, matkulRes] = await Promise.all([kelasPromise, matkulPromise]);

    if (kelasRes.error || matkulRes.error) {
      showNotification('Gagal memuat data', 'error');
    } else {
      setKelasList(kelasRes.data as Kelas[]);
      setMatkulList(matkulRes.data || []);
    }
    setLoading(false);
  };
  
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleSubmitKelas = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!formData.nama_kelas || !formData.tahun_ajaran || !formData.semester) {
      showNotification("Semua field untuk kelas baru harus diisi!", "error");
      return;
    }
    // ... sisa logic submit kelas tetap sama ...
    let error;
    if (editingId) {
      ({ error } = await supabase.from('Kelas').update(formData).eq('id', editingId));
      if (!error) showNotification('Data kelas berhasil diupdate!', 'success');
      setEditingId(null);
    } else {
      ({ error } = await supabase.from('Kelas').insert([formData]));
      if (!error) showNotification('Data kelas berhasil ditambahkan!', 'success');
    }
    if (error) { showNotification(error.message, 'error'); } 
    else {
      setFormData({ nama_kelas: '', tahun_ajaran: '', semester: '' });
      fetchData();
    }
  };

  // Fungsi baru untuk menambahkan mata kuliah ke kelas
  const handleAddCourseToClass = async (e: FormEvent, kelasId: number) => {
    e.preventDefault();
    if (!selectedCourseForAdding) {
      showNotification('Pilih mata kuliah terlebih dahulu', 'error');
      return;
    }

    const { error } = await supabase.from('module_class').insert([{
      kelas_id: kelasId,
      matakuliah_id: selectedCourseForAdding,
      jam: 'TBA' // Jam default, bisa diubah di halaman penjadwalan
    }]);

    if (error) {
      showNotification(error.message, 'error');
    } else {
      showNotification('Mata kuliah berhasil ditambahkan ke kelas!', 'success');
      setSelectedCourseForAdding('');
      setAddCourseToClassId(null); // Tutup form
      fetchData(); // Refresh data
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
    if (window.confirm("Yakin ingin menghapus data kelas ini? Menghapus kelas akan menghapus semua jadwal terkait.")) {
      const { error } = await supabase.from('Kelas').delete().eq('id', id);
      if (error) { showNotification(error.message, 'error'); } 
      else {
        fetchData(); // Refresh data setelah delete
        showNotification('Data kelas berhasil dihapus.', 'success');
      }
    }
  };

  return (
    <div className={styles.kelasPage}>
      <NotificationBanner notification={notification} />
      
      <div className={styles.formCard}>
        <h2>{editingId ? 'Edit Kelas' : 'Tambah Kelas Baru'}</h2>
        <form onSubmit={handleSubmitKelas}>
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
              
              <div>
                <h4 style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '1rem', marginBottom: '0.5rem' }}>Mata Kuliah di Kelas Ini:</h4>
                <ul className={styles.courseList}>
                  {kelas.module_class.length > 0 ? (
                    kelas.module_class.map((mc, index) => (
                      <li key={index} className={styles.courseBadge}>
                        {mc.Mata_Kuliah?.nama_mk ?? 'N/A'}
                      </li>
                    ))
                  ) : ( <p style={{fontSize: '0.9rem', margin: 0}}>Belum ada</p> )}
                </ul>
              </div>

              {/* Form untuk menambah mata kuliah */}
              {addCourseToClassId === kelas.id ? (
                <form onSubmit={(e) => handleAddCourseToClass(e, kelas.id)} style={{marginTop: '1rem'}}>
                    <select 
                        value={selectedCourseForAdding}
                        onChange={(e) => setSelectedCourseForAdding(e.target.value)}
                        style={{width: '100%', padding: '0.5rem', marginBottom: '0.5rem'}}
                        required
                    >
                        <option value="" disabled>Pilih Mata Kuliah</option>
                        {matkulList.map(mk => <option key={mk.id} value={mk.id}>{mk.nama_mk}</option>)}
                    </select>
                    <div style={{display: 'flex', gap: '0.5rem'}}>
                        <button type="submit" className={styles.cardBtn}>Simpan</button>
                        <button type="button" onClick={() => setAddCourseToClassId(null)} className={styles.cardBtn}>Batal</button>
                    </div>
                </form>
              ) : (
                <button 
                  onClick={() => setAddCourseToClassId(kelas.id)} 
                  className={styles.cardBtn} 
                  style={{marginTop: '1rem', width: 'fit-content'}}
                >
                  + Tambah MatKul
                </button>
              )}

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