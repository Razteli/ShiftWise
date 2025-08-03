
import { NextRequest, NextResponse } from 'next/server';

/**
 * Endpoint ini berfungsi sebagai webhook untuk menerima notifikasi dari
 * penyedia pembayaran (misalnya, Midtrans, Stripe, dll.).
 * Ketika pembayaran berhasil, penyedia akan mengirim POST request ke URL ini.
 *
 * @param {NextRequest} req - Objek request yang masuk dari Next.js.
 * @returns {NextResponse} - Objek response yang akan dikirim kembali.
 */
export async function POST(req: NextRequest) {
  try {
    // --- Langkah 1: Verifikasi Webhook (Sangat Penting!) ---
    // Setiap penyedia pembayaran memiliki cara sendiri untuk memverifikasi
    // bahwa webhook benar-benar berasal dari mereka. Ini biasanya melibatkan
    // pemeriksaan signature atau header khusus.
    // **ANDA HARUS MENGIMPLEMENTASIKAN INI SESUAI DOKUMENTASI PENYEDIA ANDA.**
    // Contoh untuk Stripe:
    // const signature = req.headers.get('stripe-signature');
    // const event = stripe.webhooks.constructEvent(await req.text(), signature, process.env.STRIPE_WEBHOOK_SECRET);
    //
    // Contoh untuk Midtrans:
    // const serverKey = process.env.MIDTRANS_SERVER_KEY;
    // const signatureKey = req.headers.get('x-signature-key');
    // // Lakukan validasi signatureKey...

    const body = await req.json();

    // --- Langkah 2: Proses Event Pembayaran ---
    const eventType = body.transaction_status; // Ini adalah contoh, sesuaikan dengan payload dari penyedia Anda
    const userId = body.custom_field1; // Contoh: Anda bisa mengirimkan UID pengguna saat membuat sesi pembayaran

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID tidak ditemukan dalam payload.' },
        { status: 400 }
      );
    }

    if (eventType === 'capture' || eventType === 'settlement') {
      // Pembayaran berhasil!
      console.log(`Pembayaran berhasil untuk pengguna: ${userId}`);

      // --- Langkah 3: Update Status Pengguna di Database Anda ---
      // Di sini Anda akan berinteraksi dengan database Anda (misalnya Firestore)
      // untuk mengubah status langganan pengguna dari 'Free' menjadi 'Pro'.
      //
      // Contoh dengan Firestore (membutuhkan setup @firebase/admin-sdk):
      //
      // import { adminDb } from '@/lib/firebase-admin';
      // const userRef = adminDb.collection('users').doc(userId);
      // await userRef.update({
      //   subscriptionTier: 'Pro',
      //   subscriptionEndDate: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Contoh: langganan 1 bulan
      // });
      //
      console.log(`Status pengguna ${userId} telah di-upgrade ke Pro.`);
    } else {
      // Tangani status transaksi lainnya (pending, deny, expire, dll.)
      console.log(`Menerima status transaksi '${eventType}' untuk pengguna ${userId}. Tidak ada aksi yang diambil.`);
    }

    // --- Langkah 4: Kirim Response Sukses ---
    // Kirim response 200 OK untuk memberitahu penyedia pembayaran bahwa
    // Anda telah menerima webhook dengan sukses. Jika tidak, mereka akan
    // mencoba mengirimnya lagi.
    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error: any) {
    console.error('Error memproses webhook:', error);
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    );
  }
}

// Handler untuk metode lain (GET, PUT, dll.) jika diperlukan.
export async function GET() {
    return NextResponse.json({ message: 'Metode GET tidak diizinkan untuk endpoint ini.' }, { status: 405 });
}
