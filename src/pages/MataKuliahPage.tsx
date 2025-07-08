import { useEffect, useState, useMemo, useCallback } from 'react';
import type { ChangeEvent, FormEvent, FC } from 'react';
import supabase from '../utils/supabase';
import styles from '../assets/css/MataKuliahPage.module.css';

// --- Tipe Data ---
interface MataKuliah { 
  id: number; 
  nama_mk: string;
  kode_mk: string;
  sks: number;
}
interface Kelas { id: number; nama_kelas: string; tahun_ajaran: string; semester: string | number; }
interface ScheduledCourse {
  id: number;
  jam: string;
  Mata_Kuliah: { id: number; nama_mk: string; } | null;
  Kelas: { id: number; nama_kelas: string; tahun_ajaran: string; semester: string | number; } | null;
}
// Tipe data untuk form tambah mata kuliah baru
type MatkulFormData = Omit<MataKuliah, 'id'>;


// Komponen Notifikasi
interface Notification { message: string; type: 'success' | 'error'; }
const NotificationBanner: FC<{ notification: Notification | null }> = ({ notification }) => {
  if (!notification) return null;
  return <div className={`${styles.notification} ${styles[notification.type]}`}>{notification.message}</div>;
};


const MataKuliahPage = () => {
  const [matkulList, setMatkulList] = useState<MataKuliah[]>([]);
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [scheduledList, setScheduledList] = useState<ScheduledCourse[]>([]);
  
  // State untuk form penjadwalan
  const [selectedMatkul, setSelectedMatkul] = useState<string>('');
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [jam, setJam] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');

  // State untuk form tambah mata kuliah baru
  const [matkulFormData, setMatkulFormData] = useState<MatkulFormData>({ kode_mk: '', nama_mk: '', sks: 0 });

  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [notification, setNotification] = useState<Notification | null>(null);

  const semesterOptions = useMemo(() => [...new Set(kelasList.map(k => k.semester.toString()))], [kelasList]);
  const filteredKelasList = useMemo(() => {
    if (!selectedSemester) return [];
    return kelasList.filter(k => k.semester.toString() === selectedSemester);
  }, [selectedSemester, kelasList]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    const matkulPromise = supabase.from('Mata_Kuliah').select('*');
    const kelasPromise = supabase.from('Kelas').select('*');
    const schedulePromise = supabase.from('module_class').select(`id, jam, Mata_Kuliah:matakuliah_id(id, nama_mk), Kelas:kelas_id(id, nama_kelas, tahun_ajaran, semester)`);
    const [matkulRes, kelasRes, scheduleRes] = await Promise.all([matkulPromise, kelasPromise, schedulePromise]);

    if (matkulRes.error || kelasRes.error || scheduleRes.error) {
      showNotification('Gagal memuat data', 'error');
    } else {
      setMatkulList(matkulRes.data || []);
      setKelasList(kelasRes.data || []);
      setScheduledList(scheduleRes.data as unknown as ScheduledCourse[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSemesterChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setSelectedSemester(e.target.value);
    setSelectedKelas('');
  };

  // --- Handler untuk Form Tambah Mata Kuliah Baru ---
  const handleMatkulFormChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const { name, value, type } = e.target;
    setMatkulFormData({ ...matkulFormData, [name]: type === 'number' ? parseInt(value) || 0 : value });
  };

  const handleSubmitMataKuliah = async (e: FormEvent) => {
    e.preventDefault();
    if (!matkulFormData.kode_mk || !matkulFormData.nama_mk || matkulFormData.sks <= 0) {
      showNotification('Semua field mata kuliah harus diisi dengan benar.', 'error');
      return;
    }
    const { error } = await supabase.from('Mata_Kuliah').insert([matkulFormData]);
    if (error) {
      showNotification(error.message, 'error');
    } else {
      showNotification('Mata kuliah baru berhasil ditambahkan!', 'success');
      setMatkulFormData({ nama_mk: '', kode_mk: '', sks: 0 });
      fetchData(); // Refresh data agar muncul di dropdown
    }
  };

  // --- Handler untuk Form Penjadwalan ---
  const handleSubmitSchedule = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!selectedMatkul || !selectedKelas || !jam) {
      showNotification("Semua field harus diisi!", "error");
      return;
    }
    const newSchedule = { matakuliah_id: selectedMatkul, kelas_id: selectedKelas, jam: jam };
    let error;
    if (editingId) {
      ({ error } = await supabase.from('module_class').update(newSchedule).eq('id', editingId));
      if (!error) showNotification('Jadwal berhasil diupdate!', 'success');
    } else {
      ({ error } = await supabase.from('module_class').insert([newSchedule]));
      if (!error) showNotification('Jadwal berhasil ditambahkan!', 'success');
    }
    if (error) { showNotification(error.message, 'error') } else {
      handleCancelEdit();
      fetchData();
    }
  };
  
  const handleEditClick = (schedule: ScheduledCourse) => {
    setEditingId(schedule.id);
    setSelectedSemester(schedule.Kelas?.semester.toString() ?? '');
    setTimeout(() => {
        setSelectedKelas(schedule.Kelas?.id.toString() ?? '');
    }, 0);
    setSelectedMatkul(schedule.Mata_Kuliah?.id.toString() ?? '');
    setJam(schedule.jam);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSelectedMatkul('');
    setSelectedSemester('');
    setSelectedKelas('');
    setJam('');
  };

  const handleDelete = async (id: number): Promise<void> => {
    if (window.confirm("Yakin ingin menghapus jadwal ini?")) {
      const { error } = await supabase.from('module_class').delete().eq('id', id);
      if (error) { showNotification(error.message, 'error') } 
      else {
        setScheduledList(scheduledList.filter(item => item.id !== id));
        showNotification('Jadwal berhasil dihapus.', 'success');
      }
    }
  };

  return (
    <div className={styles.matakuliahPage}>
      <NotificationBanner notification={notification} />
      
      {/* Form untuk membuat Mata Kuliah baru */}
      <div className={styles.formCard}>
        <h2>Tambah Mata Kuliah Baru (Master)</h2>
        <form onSubmit={handleSubmitMataKuliah}>
            <div className={styles.formGroup}>
              <input type="text" name="kode_mk" placeholder="Kode MK" value={matkulFormData.kode_mk} onChange={handleMatkulFormChange} required />
              <input type="text" name="nama_mk" placeholder="Nama Mata Kuliah" value={matkulFormData.nama_mk} onChange={handleMatkulFormChange} required />
              <input type="number" name="sks" placeholder="Jumlah SKS" value={matkulFormData.sks} onChange={handleMatkulFormChange} required />
              <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>Simpan</button>
            </div>
        </form>
      </div>

      {/* Form untuk menjadwalkan Mata Kuliah ke Kelas */}
      <div className={styles.formCard}>
        <h2>{editingId ? 'Edit Jadwal Kuliah' : 'Tambah Jadwal Kuliah'}</h2>
        <form onSubmit={handleSubmitSchedule}>
          <div className={styles.formGrid}>
            <select value={selectedSemester} onChange={handleSemesterChange} required>
              <option value="" disabled>Pilih Semester</option>
              {semesterOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={selectedKelas} onChange={(e) => setSelectedKelas(e.target.value)} required disabled={!selectedSemester}>
              <option value="" disabled>Pilih Kelas</option>
              {filteredKelasList.map(k => <option key={k.id} value={k.id}>{k.nama_kelas}</option>)}
            </select>
            <select value={selectedMatkul} onChange={(e) => setSelectedMatkul(e.target.value)} required>
              <option value="" disabled>Pilih Mata Kuliah</option>
              {matkulList.map(mk => <option key={mk.id} value={mk.id}>{mk.nama_mk}</option>)}
            </select>
            <input type="text" name="jam" placeholder="Jadwal Jam (Contoh: Senin, 08:00)" value={jam} onChange={(e) => setJam(e.target.value)} required />
          </div>
          <div className={styles.formActions}>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              {editingId ? 'Update Jadwal' : 'Tambah Jadwal'}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancelEdit} className={`${styles.btn} ${styles.btnSecondary}`}>Batal</button>
            )}
          </div>
        </form>
      </div>
      
      {loading ? (
        <div className={styles.loaderContainer}>Memuat data...</div>
      ) : (
        <div className={styles.itemGrid}>
          {scheduledList.map((schedule) => (
            <div key={schedule.id} className={styles.itemCard}>
              <div className={styles.cardBody}>
                <h3>{schedule.Mata_Kuliah?.nama_mk ?? 'N/A'}</h3>
                <p>
                  <strong>Kelas:</strong> {schedule.Kelas?.nama_kelas ?? 'N/A'}
                  <br/>
                  <strong>Jadwal:</strong> {schedule.jam}
                  <br/>
                  <strong>T.A:</strong> {schedule.Kelas?.tahun_ajaran ?? 'N/A'} | <strong>Semester:</strong> {schedule.Kelas?.semester ?? 'N/A'}
                </p>
              </div>
              <div className={styles.cardFooter}>
                <button onClick={() => handleEditClick(schedule)} className={styles.cardBtn}>Edit</button>
                <button onClick={() => handleDelete(schedule.id)} className={`${styles.cardBtn} ${styles.delete}`}>Hapus</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MataKuliahPage;
