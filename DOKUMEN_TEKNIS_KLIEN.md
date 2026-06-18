# Dokumentasi Teknis SIMKK
## Untuk Klien — Dibuat dengan Cara yang Mudah Dipahami

---

## Apa Itu SIMKK?

**SIMKK** adalah singkatan dari **Sistem Informasi Manajemen Kinerja Karyawan**. Aplikasi ini digunakan oleh perusahaan untuk menilai kinerja karyawan menggunakan metode **Penilaian 360°** — artinya seorang karyawan bisa dinilai oleh dirinya sendiri (self-assessment), atasan, rekan kerja, dan bawahannya.

> **Ilustrasi sederhana:**
> Bayangkan kamu ingin tahu seberapa bagus seorang karyawan bernama "Andi". Dengan SIMKK, bukan hanya atasannya yang menilai Andri — tapi juga rekan kerja, bawahan, dan Andi sendiri. Semua penilaian itu digabungkan menjadi satu hasil akhir yang adil dan komprehensif.

---

## Apa Saja yang Dibutuhkan untuk Membuat Aplikasi Ini?

Aplikasi web SIMKK dibangun menggunakan **6 teknologi utama**. Saya akan jelaskan masing-masing dengan bahasa sehari-hari:

### 1. Next.js (Frontend & Backend)
**Apa itu?** Next.js adalah sebuah "kerangka kerja" (framework) berbasis JavaScript/TypeScript yang memungkinkan pembuatan aplikasi web modern. Ia menangani dua hal:
- **Tampilan depan (Frontend):** Semua tombol, halaman, tabel, dan warna yang kamu lihat di browser.
- **Logika di belakang layar (Backend):** Proses data, autentikasi login, dan penyimpanan ke database.

**Kenapa dipilih?** Next.js sangat populer, cepat, dan stabil. Digunakan oleh perusahaan besar seperti Vercel, TikTok, dan Notion.

---

### 2. React
**Apa itu?** React adalah library (perpustakaan kode) yang menjadi "otak" dari tampilan visual aplikasi web. Setiap tombol, kartu, atau tabel yang muncul di layar adalah komponen React.

**Analoginya:** Bayangkan React seperti **kumpulan LEGO**. Setiap potong LEGO adalah satu komponen kecil (misal: satu tombol, satu kartu statistik). Kita susun LEGO-LEGO ini menjadi satu bangunan utuh — itulah aplikasi SIMKK.

---

### 3. TypeScript
**Apa itu?** TypeScript adalah versi "pintar" dari JavaScript. Ia membantu developer menemukan kesalahan kode lebih awal sebelum aplikasi dijalankan.

**Analoginya:** Jika JavaScript seperti menulis esai tanpa cek ejaan, TypeScript seperti menulis esai dengan auto-check spell checker. Meminimalkan kesalahan ketik dan typo yang bisa menyebabkan error.

---

### 4. Tailwind CSS + shadcn/ui (Tampilan)
**Apa itu?**
- **Tailwind CSS:** Framework CSS yang memungkinkan styling cepat dengan menulis kode langsung di dalam elemen HTML. Tidak perlu membuat file CSS terpisah.
- **shadcn/ui:** Kumpulan komponen UI (tombol, tabel, dialog popup) yang sudah dirancang dengan indah dan konsisten.

**Analogi:** Jika membuat website tanpa ini seperti mengecat rumah dari nol — dengan Tailwind dan shadcn/ui, cat, lantai, dan furnitur sudah tersedia dalam paket yang rapi.

---

### 5. PostgreSQL (Database)
**Apa itu?** Database adalah "tempat penyimpanan data" yang terstruktur — seperti spreadsheet yang sangat canggih dan aman.

**Analoginya:**
- **Spreadsheet Excel** = database sederhana yang bisa dilihat manusia
- **PostgreSQL** = database profesional yang bisa dibaca dan ditulis oleh aplikasi secara otomatis

Di SIMKK, PostgreSQL menyimpan:
- Data karyawan (nama, jabatan, divisi)
- Akun login (username, password terenkripsi)
- Hasil penilaian kinerja
- Semua data AKHLAK

**Penyedia database:** Aplikasi ini menggunakan **Neon** (layanan cloud PostgreSQL) yang menyediakan database online yang aman, otomatis ter-backup, dan bisa diakses dari mana saja.

---

### 6. NextAuth.js (Sistem Login)
**Apa itu?** NextAuth.js adalah library khusus untuk menangani proses autentikasi — yaitu memastikan bahwa hanya orang yang punya akun yang bisa masuk ke aplikasi.

**Bagaimana kerjanya di SIMKK?**
1. Kamu memasukkan username dan password
2. NextAuth.js memverifikasi kredensial melawan database
3. Jika benar, server membuat **session token** (token sesi) — seperti "kartu identitas sementara" yang membuat kamu tetap logged in
4. Token ini disimpan dalam bentuk **cookie** di browser kamu

**Keamanan:** Password tidak pernah disimpan dalam bentuk teks biasa — melainkan di-hash (dienkripsi satu arah) menggunakan algoritma **bcrypt**. Même jika seseorang membobol database, mereka tidak bisa membaca password.

---

### 7. Prisma (Penghubung Aplikasi ke Database)
**Apa itu?** Prisma adalah alat (tool) yang menjadi "jembatan" antara kode aplikasi (Next.js) dan database (PostgreSQL). Ia membuat proses menyimpan dan mengambil data menjadi lebih aman dan mudah.

**Analogi:** Jika database adalah gudang dan aplikasi adalah pekerja, Prisma adalah forklift yang membantu pekerja mengambil dan menyimpan barang dengan rapi dan efisien.

---

### 8. Recharts (Grafik & Visualisasi)
**Apa itu?** Recharts adalah library untuk menampilkan data dalam bentuk grafik dan diagram. Digunakan di dashboard SIMKK untuk menampilkan statistik penilaian secara visual.

---

### 9. Vercel (Platform Deployment)
**Apa itu?** Vercel adalah layanan hosting yang secara otomatis mengambil kode dari GitHub, membangun aplikasi, dan men-deploy-nya ke internet. Setiap kali ada perubahan kode, Vercel otomatis memperbarui aplikasi.

**Alur deploy:**
```
Developer push kode ke GitHub
         ↓
Vercel otomatis mendeteksi perubahan
         ↓
Vercel membangun aplikasi (build)
         ↓
Aplikasi di-publish ke internet
         ↓
Klien bisa mengakses di browser
```

---

## Diagram Alur Sistem (Arsitektur)

Berikut gambaran sederhana bagaimana data mengalir dalam SIMKK:

```
┌─────────────────────────────────────────────────────┐
│                    BROWSER KLIEN                     │
│              (Chrome, Firefox, Safari)               │
└──────────────────────┬──────────────────────────────┘
                       │  HTTPS (enkripsi)
         ┌─────────────▼──────────────┐
         │      SERVER VERCEL         │
         │    (Next.js Application)   │
         │                            │
         │  ┌──────────────────────┐  │
         │  │   Halaman Web        │  │
         │  │  (React Components)  │  │
         │  └──────────────────────┘  │
         │  ┌──────────────────────┐  │
         │  │   Logika & Proses   │  │
         │  │   (API Routes)       │  │
         │  └──────────────────────┘  │
         └──────────────┬──────────────┘
                        │
           ┌────────────▼──────────────┐
           │      DATABASE NEON         │
           │      (PostgreSQL)         │
           │                            │
           │  • Tabel Users            │
           │  • Tabel Karyawan        │
           │  • Tabel Penilaian       │
           │  • Tabel Hasil           │
           └───────────────────────────┘
```

---

## Struktur Tabel Database

Database SIMKK terdiri dari **4 tabel utama:**

### Tabel 1: Users (Akun Login)
| Kolom | Jenis | Penjelasan |
|-------|-------|------------|
| id | UUID | ID unik untuk setiap akun |
| username | Text | Nama login (contoh: `hrd_admin`) |
| password | Text | Password terenkripsi (bukan teks biasa!) |
| email | Text | Alamat email (opsional) |
| role | Enum | Peran: `HRD` atau `KARYAWAN` |
| createdAt | DateTime | Kapan akun dibuat |

### Tabel 2: Karyawan (Profil Karyawan)
| Kolom | Jenis | Penjelasan |
|-------|-------|------------|
| id | UUID | ID unik karyawan |
| userId | UUID (FK) | Mengarah ke akun user terkait |
| nama | Text | Nama lengkap |
| jabatan | Text | Jabatan (contoh: Staff Keuangan) |
| divisi | Text | Divisi (contoh: Keuangan, HRD, IT) |
| createdAt | DateTime | Kapan profil dibuat |

> **Catatan:** 1 User memiliki 1 profil Karyawan. User adalah "akun login", Karyawan adalah "data pribadi".

### Tabel 3: Penilaian (Penilaian Kinerja)
| Kolom | Jenis | Penjelasan |
|-------|-------|------------|
| id | UUID | ID unik penilaian |
| jenis | Enum | Jenis: `SELF`, `ATASAN`, `REKAN`, `BAWAHAN` |
| periode | Text | Periode penilaian (contoh: "2026-Q1") |
| status | Enum | Status: `DRAFT`, `SUBMITTED`, `COMPLETED` |
| createdAt | DateTime | Kapan penilaian dibuat |

### Tabel 4: DetailPenilaian (Nilai per Indikator)
| Kolom | Jenis | Penjelasan |
|-------|-------|------------|
| id | UUID | ID unik |
| penilaianId | UUID (FK) | Mengarah ke tabel Penilaian |
| penilaiId | UUID (FK) | Siapa yang menilai |
| dinilaiId | UUID (FK) | Siapa yang dinilai |
| indikator | Enum | Nilai AKHLAK: `AMANAH`, `KOMPETEN`, dll |
| nilai | Integer | Skor 1-5 |
| komentar | Text | Catatan/umpan balik (opsional) |

---

## 6 Nilai AKHLAK — Metode Penilaian

AKHLAK adalah nilai-nilai yang digunakan untuk menilai kinerja karyawan:

| Singkat | Nilai | Penjelasan Sederhana |
|---------|-------|---------------------|
| **A** | Amanah | Bisa dipercaya, jujur, bertanggung jawab |
| **K** | Kompeten | Punya keahlian dan kemampuan untuk pekerjaannya |
| **H** | Harmonis | Bisa bergaul dan bekerja sama dengan tim |
| **L** | Loyal | Setia dan berdedikasi kepada perusahaan |
| **A** | Adaptif | Mampu menyesuaikan diri dengan perubahan |
| **K** | Kolaboratif | Pandai bekerja sama untuk mencapai target bersama |

**Skala Penilaian (1–5):**
```
1 = Sangat Kurang  → Kinerja sangat di bawah standar
2 = Kurang         → Kinerja masih perlu banyak perbaikan
3 = Cukup          → Kinerja cukup memadai
4 = Baik           → Kinerja baik, memenuhi ekspektasi
5 = Sangat Baik    → Kinerja luar biasa, melebihi ekspektasi
```

---

## Jenis Penilaian dalam SIMKK

### 1. Penilaian Mandiri (Self Assessment)
Karyawan menilai dirinya sendiri berdasarkan 6 nilai AKHLAK.

### 2. Penilaian Atasan (Superior Assessment)
Atasan langsung menilai kinerja bawahannya.

### 3. Penilaian Rekan Kerja (Peer Assessment)
Rekan kerja satu tim saling memberikan penilaian.

### 4. Penilaian Bawahan (Subordinate Assessment)
Bawahan memberikan penilaian terhadap atasannya (360° penuh).

---

## Roles & Hak Akses

### Role HRD (Administrator)
Orang dengan role HRD adalah **admin sistem**. Mereka bisa:
- Mengelola data karyawan (tambah, edit, hapus)
- Membuat dan mengelola penilaian kinerja
- Melihat hasil penilaian semua karyawan
- Mengekspor laporan ke PDF
- Mengelola hak akses pengguna

### Role Karyawan (User Biasa)
Karyawan reguler bisa:
- Melihat profil dan data pribadi
- Membuat dan mengisi penilaian kinerja
- Melihat hasil penilaian pribadi

---

## Alur Penggunaan Aplikasi

### Scenario: HRD Ingin Menilai Kinerja Seorang Karyawan

```
1. HRD login ke aplikasi
         ↓
2. HRD masuk ke menu "Penilaian Kinerja"
         ↓
3. HRD klik "Buat Penilaian Baru"
         ↓
4. HRD pilih karyawan yang akan dinilai
         ↓
5. HRD pilih jenis penilaian (Self/Atasan/Rekan/Bawahan)
         ↓
6. HRD isi nilai untuk setiap indikator AKHLAK (1-5)
         ↓
7. HRD klik "Simpan" atau "Kirim"
         ↓
8. Data tersimpan di database PostgreSQL
         ↓
9. Hasil bisa dilihat di menu "Hasil Penilaian"
```

### Scenario: Karyawan Ingin Melihat Nilainya

```
1. Karyawan login ke aplikasi
         ↓
2. Masuk ke menu "Hasil Penilaian"
         ↓
3. Sistem mengambil data dari database berdasarkan user ID
         ↓
4. Sistem menghitung rata-rata nilai AKHLAK
         ↓
5. Dashboard menampilkan hasil dengan grafik
```

---

## Keamanan Aplikasi

### 1. Password Terenkripsi
Password disimpan menggunakan algoritma **bcrypt** — satu arah, tidak bisa dibalik. Même administrator tidak bisa melihat password asli.

### 2. Session Management
Setelah login, server memberikan "token sesi" yang tersimpan di cookie browser. Token ini memiliki batas waktu dan tidak bisa dipalsukan.

### 3. Role-Based Access Control (RBAC)
Tidak semua orang bisa mengakses semua halaman:
- Hanya HRD yang bisa melihat halaman "Manajemen Karyawan"
- Karyawan reguler tidak bisa mengakses halaman HRD
- Ini diatur di level server, bukan hanya tampilan

### 4. Enkripsi Data (HTTPS)
Semua data yang dikirim antara browser dan server dienkripsi menggunakan HTTPS (SSL/TLS).

---

## Deployment & Infrastruktur

### Di Mana Aplikasi Ini Berjalan?

```
┌──────────────────────────────────────────────────────┐
│                   VERCEL CLOUD                       │
│                                                      │
│  ┌────────────────────────────────────────────┐     │
│  │     Next.js Application (Server)           │     │
│  │     - Server-side rendering                │     │
│  │     - API Routes                           │     │
│  │     - Static assets (CSS, JS, images)      │     │
│  └────────────────────────────────────────────┘     │
└──────────────────────────┬───────────────────────────┘
                           │
           ┌───────────────┼───────────────┐
           ↓               ↓               ↓
     ┌──────────┐   ┌──────────┐    ┌──────────┐
     │  Vercel  │   │  Vercel  │    │  Vercel  │
     │ Edge     │   │ Server   │    │ Postgres │
     │ Network  │   │ (Node.js)│    │ (Neon)   │
     │ CDN      │   │          │    │          │
     └──────────┘   └──────────┘    └──────────┘
```

### GitHub Repository
Kode sumber aplikasi tersimpan di GitHub: `https://github.com/GaleAdi/simkk`

Setiap kali ada perubahan kode yang di-push ke GitHub, Vercel secara otomatis:
1. Mengunduh kode terbaru
2. Meng-compile/membangun aplikasi
3. Men-deploy versi baru ke internet

Ini disebut **CI/CD (Continuous Integration / Continuous Deployment)**.

---

## Environment Variables (Konfigurasi Server)

Ada beberapa konfigurasi rahasia yang disimpan di server Vercel (tidak bisa dilihat publik):

| Variabel | Fungsi |
|----------|--------|
| `DATABASE_URL` | Alamat koneksi ke database PostgreSQL |
| `NEXTAUTH_SECRET` | Kunci rahasia untuk mengenkripsi session token |
| `NEXTAUTH_URL` | URL utama aplikasi (untuk Vercel: biasanya kosong atau diatur otomatis) |

> **Catatan:** Variabel ini tidak boleh dibagikan ke publik karena merupakan "kunci" untuk mengakses database dan server.

---

## Ringkasan Teknologi

| Komponen | Teknologi | Fungsi |
|----------|-----------|--------|
| Frontend | Next.js + React | Tampilan dan interaksi pengguna |
| Styling | Tailwind CSS + shadcn/ui | Desain visual aplikasi |
| Programming Language | TypeScript | Kode yang lebih aman & terstruktur |
| Backend Logic | Next.js API Routes | Logika di balik layar |
| Database | PostgreSQL (Neon) | Penyimpanan data |
| ORM | Prisma | Penghubung aplikasi ke database |
| Authentication | NextAuth.js | Sistem login & keamanan |
| Charts | Recharts | Grafik di dashboard |
| PDF Export | jsPDF + jspdf-autotable | Generate laporan PDF |
| Hosting | Vercel | Aplikasi tersedia di internet |
| Version Control | Git + GitHub | Penyimpanan & versioning kode |

---

## FAQ (Pertanyaan Umum)

**Q: Apakah data karyawan aman?**
A: Ya. Password dienkripsi, data disimpan di database cloud yang terenkripsi, dan akses dibatasi berdasarkan role.

**Q: Apakah aplikasi bisa diakses offline?**
A: Tidak. SIMKK adalah aplikasi web — memerlukan koneksi internet untuk beroperasi.

**Q: Bagaimana jika lupa password?**
A: Saat ini fitur "lupa password" belum tersedia. Hubungi administrator HRD untuk reset password.

**Q: Apakah bisa menambah karyawan baru?**
A: Ya. Login sebagai HRD → Manajemen Karyawan → Tambah Karyawan.

**Q: Apakah aplikasi bisa diakses dari HP?**
A: Ya. Aplikasi dirancang responsif dan bisa digunakan dari smartphone, tablet, maupun komputer.

---

*Dokumen ini dibuat untuk membantu pemahaman klien tentang sistem yang digunakan. Untuk pertanyaan teknis lebih lanjut, silakan hubungi tim pengembang.*
