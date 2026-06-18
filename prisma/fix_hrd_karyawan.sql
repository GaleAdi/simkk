-- Script untuk menambahkan record Karyawan untuk HRD
-- Jalankan SEKALI saja, aman untuk data yang sudah ada

-- Cek apakah HRD sudah punya Karyawan record
SELECT u.id, u.username, u.role, k.id as karyawan_id
FROM "User" u
LEFT JOIN "Karyawan" k ON k."userId" = u.id
WHERE u.role = 'HRD';

-- Insert Karyawan record untuk HRD (kalau belum ada)
INSERT INTO "Karyawan" (id, "userId", nama, jabatan, divisi, "createdAt", "updatedAt")
SELECT
  gen_random_uuid()::text,
  u.id,
  COALESCE(h.nama, 'Administrator HRD'),
  COALESCE(h.nama, 'Administrator HRD'),
  'Human Resource Development',
  NOW(),
  NOW()
FROM "User" u
LEFT JOIN "HRD" h ON h."userId" = u.id
LEFT JOIN "Karyawan" k ON k."userId" = u.id
WHERE u.role = 'HRD' AND k.id IS NULL;
