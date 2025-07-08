import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import supabase from '../utils/supabase';
import styles from '../assets/css/DashboardPage.module.css';

// Tipe data untuk ringkasan
interface SummaryData {
  mahasiswa: number;
  dosen: number;
  kelas: number;
  matakuliah: number;
}
interface MahasiswaPreview {
  id: number;
  nama_lengkap: string;
  jurusan: string;
}
interface DosenPreview {
  id: number;
  nama_lengkap: string;
  bidang_keahlian: string;
}
interface KelasPreview {
  id: number;
  nama_kelas: string;
  semester: string | number;
}
interface MatakuliahPreview {
  id: number;
  nama_mk: string;
  sks: number;
}

// Tipe data untuk ringkasan (tetap sama)
interface SummaryData {
  mahasiswa: number;
  dosen: number;
  kelas: number;
  matakuliah: number;
}

// Gunakan tipe data pratinjau yang sudah spesifik
interface PreviewData {
  mahasiswa: MahasiswaPreview[];
  dosen: DosenPreview[];
  kelas: KelasPreview[];
  matakuliah: MatakuliahPreview[];
}

const DashboardPage = () => {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      // Ambil jumlah data dari setiap tabel
      const mhsCountPromise = supabase.from('Mahasiswa').select('*', { count: 'exact', head: true });
      const dosenCountPromise = supabase.from('Dosen').select('*', { count: 'exact', head: true });
      const kelasCountPromise = supabase.from('Kelas').select('*', { count: 'exact', head: true });
      const matkulCountPromise = supabase.from('Mata_Kuliah').select('*', { count: 'exact', head: true });

      // Ambil 5 data pertama untuk pratinjau
      const mhsPreviewPromise = supabase.from('Mahasiswa').select('id, nama_lengkap, jurusan').limit(5);
      const dosenPreviewPromise = supabase.from('Dosen').select('id, nama_lengkap, bidang_keahlian').limit(5);
      const kelasPreviewPromise = supabase.from('Kelas').select('id, nama_kelas, semester').limit(5);
      const matkulPreviewPromise = supabase.from('Mata_Kuliah').select('id, nama_mk, sks').limit(5);

      const [
        mhsCount, dosenCount, kelasCount, matkulCount,
        mhsPreview, dosenPreview, kelasPreview, matkulPreview
      ] = await Promise.all([
        mhsCountPromise, dosenCountPromise, kelasCountPromise, matkulCountPromise,
        mhsPreviewPromise, dosenPreviewPromise, kelasPreviewPromise, matkulPreviewPromise
      ]);
      
      setSummary({
        mahasiswa: mhsCount.count ?? 0,
        dosen: dosenCount.count ?? 0,
        kelas: kelasCount.count ?? 0,
        matakuliah: matkulCount.count ?? 0,
      });

      setPreview({
        mahasiswa: mhsPreview.data ?? [],
        dosen: dosenPreview.data ?? [],
        kelas: kelasPreview.data ?? [],
        matakuliah: matkulPreview.data ?? [],
      });

      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading || !summary || !preview) {
    return <div className={styles.loaderContainer}>Memuat Data Dashboard...</div>;
  }

  return (
    <div className={styles.dashboardPage}>
      <header className={styles.header}>
        <h1>Dashboard</h1>
        <p>Selamat datang! Berikut adalah ringkasan data dari sistem Anda.</p>
      </header>

      <section className={styles.summaryGrid}>
        <div className={styles.summaryCard}>
          <span className={styles.count}>{summary.mahasiswa}</span>
          <span className={styles.title}>Total Mahasiswa</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.count}>{summary.dosen}</span>
          <span className={styles.title}>Total Dosen</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.count}>{summary.kelas}</span>
          <span className={styles.title}>Total Kelas</span>
        </div>
        <div className={styles.summaryCard}>
          <span className={styles.count}>{summary.matakuliah}</span>
          <span className={styles.title}>Total Mata Kuliah</span>
        </div>
      </section>

      {/* Pratinjau Data Mahasiswa */}
      <section className={styles.dataSection}>
        <div className={styles.sectionHeader}>
          <h2>Pratinjau Data Mahasiswa</h2>
          <Link to="/mahasiswa" className={styles.manageButton}>Kelola Mahasiswa</Link>
        </div>
        <table className={styles.previewTable}>
          <thead><tr><th>Nama Lengkap</th><th>Jurusan</th></tr></thead>
          <tbody>
            {preview.mahasiswa.map(item => (
              <tr key={item.id}><td>{item.nama_lengkap}</td><td>{item.jurusan}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Pratinjau Data Dosen */}
      <section className={styles.dataSection}>
        <div className={styles.sectionHeader}>
          <h2>Pratinjau Data Dosen</h2>
          <Link to="/dosen" className={styles.manageButton}>Kelola Dosen</Link>
        </div>
        <table className={styles.previewTable}>
          <thead><tr><th>Nama Lengkap</th><th>Bidang Keahlian</th></tr></thead>
          <tbody>
            {preview.dosen.map(item => (
              <tr key={item.id}><td>{item.nama_lengkap}</td><td>{item.bidang_keahlian}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className={styles.dataSection}>
        <div className={styles.sectionHeader}>
          <h2>Pratinjau Data Kelas</h2>
          <Link to="/kelas" className={styles.manageButton}>Kelola Kelas</Link>
        </div>
        <table className={styles.previewTable}>
          <thead><tr><th>Nama Kelas</th><th>Semester</th></tr></thead>
          <tbody>
            {preview.kelas.map(item => (
              <tr key={item.id}><td>{item.nama_kelas}</td><td>{item.semester}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      
      {/* Pratinjau Data Mata Kuliah */}
      <section className={styles.dataSection}>
        <div className={styles.sectionHeader}>
          <h2>Pratinjau Data Mata Kuliah</h2>
          <Link to="/matakuliah" className={styles.manageButton}>Kelola Mata Kuliah</Link>
        </div>
        <table className={styles.previewTable}>
          <thead><tr><th>Nama Mata Kuliah</th><th>SKS</th></tr></thead>
          <tbody>
            {preview.matakuliah.map(item => (
              <tr key={item.id}><td>{item.nama_mk}</td><td>{item.sks}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
      
    </div>
  );
};

export default DashboardPage;