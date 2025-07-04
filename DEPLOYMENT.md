# Panduan Deploy ke Vercel

Dokumen ini berisi panduan untuk mendeploy aplikasi ini ke Vercel, terutama mengenai cara mengatur Environment Variable yang dibutuhkan.

## Masalah Umum: Gagal Generate Jadwal oleh AI

Setelah di-deploy, seringkali fitur AI gagal berfungsi. Ini biasanya terjadi karena aplikasi di server Vercel tidak memiliki akses ke `GOOGLE_API_KEY`.

Kunci API ini bersifat rahasia dan tidak disimpan di dalam kode (untuk alasan keamanan). Oleh karena itu, Anda perlu memberitahu Vercel tentang kunci ini secara manual melalui pengaturan di dashboard Vercel.

## Cara Mengatur GOOGLE_API_KEY di Vercel

Ikuti langkah-langkah berikut untuk menambahkan kunci API Anda ke Vercel:

1.  **Login ke Vercel**: Buka [vercel.com](https://vercel.com) dan login ke akun Anda.

2.  **Buka Dashboard Proyek**: Pilih proyek aplikasi ini dari daftar proyek Anda.

3.  **Masuk ke Pengaturan (Settings)**: Di halaman proyek, klik tab **Settings**.

4.  **Pilih Environment Variables**: Di menu sebelah kiri, klik **Environment Variables**.

5.  **Tambahkan Variabel Baru**:
    *   **Name**: Ketik `GOOGLE_API_KEY` (pastikan namanya persis seperti ini).
    *   **Value**: Tempelkan (paste) kunci API Google Anda yang valid ke kolom ini.
    *   Biarkan opsi lainnya (seperti *Environment*) pada pengaturan default, kecuali jika Anda memiliki kebutuhan khusus.

6.  **Simpan**: Klik tombol **Save** untuk menyimpan variabel.

7.  **Redeploy (Deploy Ulang)**: Agar perubahan environment variable ini diterapkan, Anda perlu melakukan deploy ulang.
    *   Buka tab **Deployments** di proyek Anda.
    *   Cari deployment terbaru, klik menu titik tiga (...) di sebelah kanannya, lalu pilih **Redeploy**.

Setelah proses deploy ulang selesai, aplikasi Anda seharusnya sudah bisa mengakses Google API dengan benar dan fitur AI akan berfungsi seperti yang diharapkan.
