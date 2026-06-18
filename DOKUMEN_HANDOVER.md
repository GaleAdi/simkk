# DOKUMEN HANDOVER
# Sistem Informasi Manajemen Kinerja Karyawan (SIMKK)

---

## 1. Informasi Project

| Item | Detail |
|------|--------|
| **Nama Aplikasi** | SIMKK - Sistem Informasi Manajemen Kinerja Karyawan |
| **Perusahaan** | PT Energi Nusantara |
| **URL Production** | https://ptenerginusantara360-e6z5khqk1-galeadis-projects.vercel.app |
| **GitHub Repository** | https://github.com/GaleAdi/simkk |
| **Database** | PostgreSQL (Neon) |
| **Framework** | Next.js 14 + Prisma + NextAuth.js |

---

## 2. Akun Login Aplikasi

### Akun HRD (Administrator)
| Username | Password |
|----------|----------|
| `hrd_admin` | `password123` |

### Akun Karyawan
| Username | Password |
|----------|----------|
| `karyawan1` | `password123` |
| `karyawan2` | `password123` |
| `karyawan3` | `password123` |
| `dewi_lestari` | `password123` |
| `bambang_s` | `password123` |
| `ratna_p` | `password123` |
| `eko_w` | `password123` |
| `sari_w` | `password123` |
| `dimas_a` | `password123` |
| `fitri_h` | `password123` |
| `heru_m` | `password123` |

> **Catatan:** Semua password awal adalah `password123`. Disarankan untuk mengganti password setelah handover.

---

## 3. Nilai AKHLAK

Aplikasi ini menggunakan metode penilaian 360° dengan 6 indikator AKHLAK:

| Singkat | Nilai | Deskripsi |
|---------|-------|-----------|
| **A** | Amanah | Memegang teguh kepercayaan, jujur, dan bertanggung jawab |
| **K** | Kompeten | Memiliki kemampuan dan keahlian yang dibutuhkan |
| **H** | Harmonis | Menjaga keselarasan dalam lingkungan kerja |
| **L** | Loyal | Setia dan berdedikasi kepada organisasi |
| **A** | Adaptif | Mampu menyesuaikan diri dengan perubahan |
| **K** | Kolaboratif | Bekerja sama untuk mencapai tujuan bersama |

**Skala Penilaian:** 1–5
- 1 = Sangat Kurang
- 2 = Kurang
- 3 = Cukup
- 4 = Baik
- 5 = Sangat Baik

---

## 4. Fitur Utama

### Untuk HRD:
- Dashboard overview dengan statistik penilaian
- Manajemen Karyawan (tambah, edit, hapus)
- Buat dan kelola Penilaian Kinerja
- Lihat Hasil Penilaian semua karyawan
- Export Laporan ke PDF
- Kelola Hak Akses pengguna

### Untuk Karyawan:
- Dashboard dengan info profil
- Lihat dan isi Penilaian Kinerja
- Lihat Hasil Penilaian pribadi
- Profil dan nilai AKHLAK

---

## 5. Cara Menambah Karyawan Baru

1. Login sebagai **HRD**
2. Menu: **Manajemen Karyawan**
3. Klik **Tambah Karyawan**
4. Isi formulir (Nama, Jabatan, Divisi, Username, Password)
5. Klik **Tambah**

---

## 6. Cara Membuat Penilaian

### HRD membuat penilaian:
1. Menu: **Penilaian Kinerja**
2. Klik **Buat Penilaian**
3. Pilih karyawan yang dinilai
4. Pilih jenis penilaian (Self / Atasan / Rekan Kerja / Bawahan)
5. Klik **Buat Penilaian**

### Karyawan membuat penilaian:
1. Menu: **Penilaian Kinerja**
2. Klik **Buat Penilaian**
3. Pilih rekan yang dinilai
4. Pilih jenis penilaian
5. Klik **Buat Penilaian**

---

## 7. Teknologi yang Digunakan

| Komponen | Teknologi |
|----------|-----------|
| Frontend | Next.js 14 (React) |
| Styling | Tailwind CSS + shadcn/ui |
| Database | PostgreSQL (Neon) |
| ORM | Prisma |
| Authentication | NextAuth.js |
| Charts | Recharts |
| PDF Export | jsPDF |
| Deployment | Vercel |

---

## 8. Kontak Teknis

| Peran | Nama |
|-------|------|
| **Pengembang** | (isi nama developer) |
| **Email** | (isi email developer) |

---

## 9. Catatan Penting

- **Password default** (`password123`) **HARUS** diganti sebelum digunakan secara resmi
- Jika ada masalah teknis, cek log di **Vercel Dashboard** → **Deployment** → **Logs**
- Database dapat diakses di **Neon Console**
- Repository GitHub bisa di-clone untuk development lokal

---

*Dokumen ini dibuat pada Juni 2026*
