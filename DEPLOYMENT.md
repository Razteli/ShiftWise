# Panduan Deploy ke Vercel

Dokumen ini berisi panduan untuk mendeploy aplikasi ini ke Vercel, terutama mengenai cara mengatur Environment Variable yang dibutuhkan.

## Variabel yang Dibutuhkan

Aplikasi ini memerlukan dua set environment variables:

1.  **Konfigurasi Firebase (Client-side)**: Ini dibutuhkan agar aplikasi di browser bisa terhubung ke Firebase untuk autentikasi.
2.  **Kunci API Google (Server-side)**: Ini dibutuhkan oleh Genkit di server untuk bisa memanggil AI.

Berikut adalah daftar lengkap variabel yang perlu Anda atur di Vercel:

-   `FIREBASE_API_KEY`
-   `FIREBASE_AUTH_DOMAIN`
-   `FIREBASE_PROJECT_ID`
-   `FIREBASE_STORAGE_BUCKET`
-   `FIREBASE_MESSAGING_SENDER_ID`
-   `FIREBASE_APP_ID`
-   `GOOGLE_API_KEY`

## Cara Mengatur Environment Variables di Vercel

Ikuti langkah-langkah berikut untuk menambahkan semua kunci yang dibutuhkan ke proyek Vercel Anda:

1.  **Login ke Vercel**: Buka [vercel.com](https://vercel.com) dan login ke akun Anda.

2.  **Buka Dashboard Proyek**: Pilih proyek aplikasi ini dari daftar proyek Anda.

3.  **Masuk ke Pengaturan (Settings)**: Di halaman proyek, klik tab **Settings**.

4.  **Pilih Environment Variables**: Di menu sebelah kiri, klik **Environment Variables**.

5.  **Tambahkan Setiap Variabel**: Anda perlu mengulangi proses ini untuk **SETIAP** variabel dari daftar di atas.
    *   **Name**: Ketik nama variabel (contoh: `FIREBASE_API_KEY`).
    *   **Value**: Tempelkan (paste) nilai yang sesuai untuk variabel tersebut.
    *   Biarkan opsi lainnya pada pengaturan default.
    *   Klik **Save**.

6.  **Ulangi** untuk semua variabel lainnya (`FIREBASE_AUTH_DOMAIN`, `GOOGLE_API_KEY`, dst.).

7.  **Redeploy (Deploy Ulang)**: Setelah semua variabel berhasil ditambahkan, Anda perlu melakukan deploy ulang agar perubahan ini diterapkan.
    *   Buka tab **Deployments** di proyek Anda.
    *   Cari deployment terbaru, klik menu titik tiga (...) di sebelah kanannya, lalu pilih **Redeploy**.

Setelah proses deploy ulang selesai, aplikasi Anda seharusnya sudah bisa mengakses Firebase dan Google AI dengan benar.
