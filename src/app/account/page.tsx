
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
import { useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, LogOut, Sparkles, UserCircle } from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  // Placeholder - in a real app, this would come from your database
  const subscriptionTier = 'Free'; 
  const isPro = subscriptionTier === 'Pro';

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 md:p-8">
        <header className="mb-10">
           <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
            Akun Saya
           </h1>
           <p className="text-lg text-muted-foreground mt-2">
            Kelola informasi profil, langganan, dan pengaturan Anda.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-8">
             <Card>
              <CardHeader className="flex-row items-center gap-4 space-y-0">
                <UserCircle className="h-12 w-12 text-muted-foreground" />
                <div>
                   <CardTitle className="text-xl">{user.displayName || 'Pengguna'}</CardTitle>
                   <CardDescription>{user.email}</CardDescription>
                </div>
              </CardHeader>
               <CardFooter>
                  <Button variant="outline" className="w-full" onClick={handleLogout}>
                    <LogOut className="mr-2"/>
                    Logout
                  </Button>
               </CardFooter>
            </Card>
             <Card>
              <CardHeader>
                <CardTitle>Bantuan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Butuh bantuan atau punya pertanyaan? Hubungi tim support kami.
                </p>
              </CardContent>
              <CardFooter>
                 <Button variant="outline" className="w-full" asChild>
                    <Link href="mailto:support@shiftwise.app">
                      Hubungi Support
                    </Link>
                 </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
             <Card>
                <CardHeader>
                    <CardTitle>Status Langganan</CardTitle>
                    <CardDescription>
                        Anda saat ini menggunakan paket <Badge variant={isPro ? "default" : "secondary"}>{subscriptionTier}</Badge>.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h4 className="font-semibold mb-2">Fitur Paket {subscriptionTier}</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                           <li className="flex items-start">
                             <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                             <span>Analisis jadwal dari file (Gambar, Word, Excel)</span>
                           </li>
                           <li className="flex items-start">
                             <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                             <span>Pembuatan jadwal manual dengan ekspor PDF & CSV</span>
                           </li>
                           <li className="flex items-start">
                             <CheckCircle className="h-4 w-4 mr-2 mt-0.5 text-green-500 flex-shrink-0" />
                             <span>Kalkulator Perawat (Metode Depkes RI)</span>
                           </li>
                           <li className="flex items-start">
                            <CheckCircle className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${isPro ? 'text-green-500' : 'text-muted-foreground'}`}/>
                             <span>
                                Generate jadwal dengan AI 
                                <span className={`font-semibold ${isPro ? 'text-primary' : ''}`}> {isPro ? 'Tanpa Batas' : ' (2x per akun)'}</span>
                            </span>
                           </li>
                           <li className="flex items-start">
                             <CheckCircle className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${isPro ? 'text-green-500' : 'text-muted-foreground'}`}/>
                              <span>
                                Maksimal karyawan per jadwal
                                <span className={`font-semibold ${isPro ? 'text-primary' : ''}`}> {isPro ? 'Tanpa Batas' : ' (10 karyawan)'}</span>
                              </span>
                           </li>
                            <li className="flex items-start">
                             <CheckCircle className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${isPro ? 'text-green-500' : 'text-muted-foreground'}`}/>
                              <span>
                                Metode Kalkulator Perawat Lanjutan
                                <span className={`font-semibold ${isPro ? 'text-primary' : ''}`}> {isPro ? ' (Douglas, Gillies, dll.)' : ''}</span>
                              </span>
                           </li>
                        </ul>
                    </div>
                </CardContent>
                {!isPro && (
                  <CardFooter className="border-t pt-6">
                      <Button className="w-full" asChild>
                        <Link href="/account/billing">
                            <Sparkles className="mr-2"/>
                            Upgrade ke Pro
                        </Link>
                      </Button>
                  </CardFooter>
                )}
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
