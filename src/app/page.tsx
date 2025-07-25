
'use client';

import { Logo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { ArrowRight, Bot, Calculator, GanttChartSquare } from 'lucide-react';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur-sm">
        <div className="container mx-auto h-16 flex items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-3">
            <Logo className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">ShiftWise</h1>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative text-center py-20 md:py-32 flex flex-col items-center">
           <div
            aria-hidden="true"
            className="absolute inset-0 grid grid-cols-2 -space-x-52 opacity-40 dark:opacity-20"
          >
            <div className="blur-[106px] h-56 bg-gradient-to-br from-primary to-purple-400 dark:from-blue-700"></div>
            <div className="blur-[106px] h-32 bg-gradient-to-r from-cyan-400 to-sky-300 dark:to-indigo-600"></div>
          </div>
          <div className="container mx-auto px-4 z-10">
            <Badge
              variant="outline"
              className="mb-6 font-semibold text-primary border-primary/50"
            >
              Optimalkan Jadwal, Maksimalkan Efisiensi
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Jadwalkan Karyawan dengan Cerdas
            </h2>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              ShiftWise menggunakan kekuatan AI untuk membuat, menganalisis, dan
              mengoptimalkan jadwal shift karyawan Anda, menghemat waktu Anda
              dan mengurangi konflik.
            </p>
            <div className="mt-8 flex justify-center gap-4">
              <Button size="lg" asChild>
                <Link href="/signup">
                  Get Started for Free
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Feature Screenshot Section */}
        <section className="container mx-auto px-4">
            <div className="relative rounded-xl border bg-card shadow-2xl shadow-primary/10">
                 <Image
                    src="https://placehold.co/1200x600.png"
                    data-ai-hint="application screenshot"
                    alt="ShiftWise application screenshot"
                    width={1200}
                    height={600}
                    className="rounded-lg"
                  />
            </div>
        </section>

        {/* Features Section */}
        <section className="container mx-auto px-4 py-20 md:py-28">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
              Fitur Unggulan Kami
            </h3>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Alat lengkap untuk semua kebutuhan penjadwalan Anda, dari
              pembuatan otomatis hingga analisis mendalam.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-8 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary mb-4">
                <Bot className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">AI Scheduler</h4>
              <p className="text-muted-foreground">
                Biarkan AI secara otomatis menghasilkan jadwal yang seimbang dan
                efisien berdasarkan aturan yang Anda tentukan.
              </p>
            </div>
            <div className="p-8 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary mb-4">
                <GanttChartSquare className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Analisis Jadwal</h4>
              <p className="text-muted-foreground">
                Unggah jadwal yang ada (gambar, Word, Excel) dan dapatkan
                analisis mendalam serta saran perbaikan dari AI.
              </p>
            </div>
            <div className="p-8 border rounded-lg bg-card shadow-sm">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-primary/10 text-primary mb-4">
                <Calculator className="h-6 w-6" />
              </div>
              <h4 className="text-xl font-bold mb-2">Kalkulator Perawat</h4>
              <p className="text-muted-foreground">
                Hitung kebutuhan tenaga perawat secara akurat menggunakan
                berbagai metode standar industri.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
         <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="bg-primary/10 text-center rounded-lg p-10 md:p-16 border border-primary/20">
               <h3 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                Siap untuk Memulai?
              </h3>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Bergabunglah dengan ShiftWise hari ini dan rasakan kemudahan dalam manajemen jadwal karyawan.
              </p>
              <div className="mt-8">
                 <Button size="lg" asChild>
                  <Link href="/signup">
                    Coba Gratis Sekarang
                    <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
         </section>
      </main>

      <footer className="container mx-auto px-4 py-6 border-t">
        <p className="text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} ShiftWise. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
