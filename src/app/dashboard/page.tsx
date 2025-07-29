
'use client';

import { useState, useEffect } from 'react';
import { ShiftScheduleForm } from '@/components/shift-schedule-form';
import { ScheduleDisplay } from '@/components/schedule-display';
import type { ScheduleResult } from '../actions';
import { Logo } from '@/components/icons';
import type { ScheduleConfig } from '@/lib/schemas';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NursingCalculator } from '@/components/nursing-calculator';
import { ScheduleAnalyzer } from '@/components/schedule-analyzer';
import { Badge } from '@/components/ui/badge';
import { ManualScheduler } from '@/components/manual-scheduler';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const [scheduleData, setScheduleData] = useState<{
    result: ScheduleResult;
    config: ScheduleConfig;
  } | null>(null);
  
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);


  const handleScheduleGenerated = (
    result: ScheduleResult,
    config: ScheduleConfig
  ) => {
    setScheduleData({ result, config });
  };
  
  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };
  
  if (loading || !user) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-7 w-7 text-primary" />
            <div className="flex items-baseline gap-2">
              <h1 className="text-xl font-bold tracking-tight">ShiftWise</h1>
               <Badge
                variant="outline"
                className="font-normal text-primary border-primary/50"
              >
                Dashboard
              </Badge>
            </div>
          </div>
           <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
               <Link href="/account">
                  <User />
               </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4"/>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 flex-grow">
        <Tabs defaultValue="scheduler" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto mb-8 max-w-3xl mx-auto">
            <TabsTrigger value="scheduler">AI Scheduler</TabsTrigger>
            <TabsTrigger value="manual">Jadwal Manual</TabsTrigger>
            <TabsTrigger value="analyzer">Analisis Jadwal</TabsTrigger>
            <TabsTrigger value="calculator">Kalkulator Perawat</TabsTrigger>
          </TabsList>
          <TabsContent value="scheduler">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                AI-Powered Shift Scheduling
              </h2>
              <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                Automatically generate, analyze, and optimize employee shift
                schedules with the power of AI.
              </p>
            </div>
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="lg:flex-1 lg:max-w-md w-full">
                <ShiftScheduleForm
                  onScheduleGenerated={handleScheduleGenerated}
                  schedule={scheduleData?.result?.schedule ?? null}
                />
              </div>
              <div className="lg:flex-[2] w-full min-w-0">
                <ScheduleDisplay
                  result={scheduleData?.result ?? null}
                  config={scheduleData?.config ?? null}
                />
              </div>
            </div>
          </TabsContent>
           <TabsContent value="manual">
            <ManualScheduler />
          </TabsContent>
          <TabsContent value="analyzer">
            <ScheduleAnalyzer />
          </TabsContent>
          <TabsContent value="calculator">
            <NursingCalculator />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="container mx-auto px-4 py-6 mt-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          Built with Next.js, Genkit, and ShadCN UI.
        </p>
      </footer>
    </div>
  );
}
