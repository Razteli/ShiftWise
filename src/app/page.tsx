'use client';

import { useState } from 'react';
import { ShiftScheduleForm } from '@/components/shift-schedule-form';
import { ScheduleDisplay } from '@/components/schedule-display';
import type { ScheduleResult } from './actions';
import { Logo } from '@/components/icons';
import { Github } from 'lucide-react';

export default function Home() {
  const [scheduleResult, setScheduleResult] = useState<ScheduleResult | null>(
    null
  );

  const handleScheduleGenerated = (result: ScheduleResult) => {
    setScheduleResult(result);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-7 w-7 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">ShiftWise</h1>
          </div>
          <a
            href="https://github.com/firebase/firebase-genkit-samples/tree/main/nextjs-pro"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View source code on GitHub"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Github className="h-6 w-6" />
          </a>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8 flex-grow">
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
          <ShiftScheduleForm onScheduleGenerated={handleScheduleGenerated} />
          <ScheduleDisplay result={scheduleResult} />
        </div>
      </main>

      <footer className="container mx-auto px-4 py-6 mt-8 border-t">
        <p className="text-center text-sm text-muted-foreground">
          Built with Next.js, Genkit, and ShadCN UI.
        </p>
      </footer>
    </div>
  );
}
