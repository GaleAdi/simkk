# SIMKK — Sistem Informasi Manajemen Kinerja Karyawan

Sistem penilaian kinerja karyawan 360° berbasis nilai AKHLAK untuk PT Energi Nusantara.

## Nilai AKHLAK

| Singkat | Nilai | Deskripsi |
|---------|-------|-----------|
| A | Amanah | Memegang teguh kepercayaan, jujur, dan bertanggung jawab |
| K | Kompeten | Memiliki kemampuan dan keahlian yang dibutuhkan |
| H | Harmonis | Menjaga keselarasan dalam lingkungan kerja |
| L | Loyal | Setia dan berdedikasi kepada organisasi |
| A | Adaptif | Mampu menyesuaikan diri dengan perubahan |
| K | Kolaboratif | Bekerja sama untuk mencapai tujuan bersama |

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Auth**: NextAuth.js v4
- **UI**: Tailwind CSS + shadcn/ui
- **Deployment**: Vercel

## Setup

```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dengan nilai Anda

# Push database schema
npx prisma db push

# Run development server
npm run dev
```

## Environment Variables

```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/       # Halaman login
│   ├── api/                 # API routes
│   └── dashboard/           # Dashboard HRD & Karyawan
├── components/              # Komponen UI
├── lib/                     # Utilities & Prisma client
└── hooks/                  # Custom hooks
```

## Deploy ke Vercel

1. Push kode ke GitHub
2. Import project di [vercel.com](https://vercel.com)
3. Tambahkan environment variables di Vercel dashboard
4. Deploy

## License

MIT
