
'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Sparkles, Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function BillingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);
  
  const handleUpgradeClick = () => {
    setIsProcessing(true);
    // Di aplikasi nyata, di sini Anda akan memanggil fungsi untuk membuat sesi checkout
    // dengan penyedia pembayaran (misalnya, Stripe, Midtrans).
    // Fungsi ini akan mengarahkan pengguna ke halaman pembayaran.
    //
    // Contoh:
    // const checkoutUrl = await createCheckoutSession(user.uid);
    // window.location.href = checkoutUrl;

    // Untuk demo ini, kita hanya akan menampilkan loading selama beberapa detik.
    setTimeout(() => {
        alert("Ini adalah akhir dari demo alur pembayaran. Di aplikasi nyata, Anda akan diarahkan ke halaman pembayaran eksternal.");
        setIsProcessing(false);
    }, 3000);
  }

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
         <Button variant="outline" size="sm" className="mb-6" asChild>
            <Link href="/account">
              <ArrowLeft />
              Kembali ke Akun
            </Link>
         </Button>

        <header className="mb-10 text-center">
           <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
            Upgrade ke ShiftWise Pro
           </h1>
           <p className="text-lg text-muted-foreground mt-2">
            Buka semua fitur dan maksimalkan efisiensi penjadwalan Anda.
          </p>
        </header>

        <Card>
            <CardHeader>
                <CardTitle>Paket Pro</CardTitle>
                <CardDescription>Semua fitur tanpa batas.</CardDescription>
            </CardHeader>
             <CardContent className="space-y-6">
                <div className="text-center">
                    <p className="text-4xl font-bold">Rp 150.000<span className="text-lg font-normal text-muted-foreground">/bulan</span></p>
                </div>
                 <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>Generate jadwal dengan AI <span className="font-semibold text-primary">Tanpa Batas</span></span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>Jumlah karyawan <span className="font-semibold text-primary">Tanpa Batas</span></span>
                    </li>
                    <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>Semua metode <span className="font-semibold text-primary">Kalkulator Perawat</span></span>
                    </li>
                     <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                        <span>Dukungan Prioritas</span>
                    </li>
                </ul>
                <div className="rounded-md bg-yellow-50 p-4 text-yellow-800 border border-yellow-200 text-sm">
                   <p>
                    Ini adalah halaman demo. Di aplikasi nyata, Anda akan melihat opsi pembayaran (kartu kredit, transfer bank, dll) yang disediakan oleh payment gateway seperti Midtrans atau Stripe.
                   </p>
                </div>
             </CardContent>
             <CardFooter>
                 <Button className="w-full" onClick={handleUpgradeClick} disabled={isProcessing}>
                    {isProcessing ? (
                        <Loader2 className="mr-2 animate-spin"/>
                    ) : (
                        <Sparkles className="mr-2"/>
                    )}
                    {isProcessing ? 'Memproses...' : 'Lanjutkan ke Pembayaran'}
                 </Button>
             </CardFooter>
        </Card>
      </div>
    </div>
  );
}
