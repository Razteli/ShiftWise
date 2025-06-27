'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';
import { Download, ListChecks, AlertTriangle } from 'lucide-react';
import type { ScheduleResult } from '@/app/actions';

interface ScheduleDisplayProps {
  result: ScheduleResult | null;
}

export function ScheduleDisplay({ result }: ScheduleDisplayProps) {
  const [editedSchedule, setEditedSchedule] = useState('');

  useEffect(() => {
    if (result?.schedule) {
      setEditedSchedule(result.schedule);
    }
  }, [result]);

  const handleExport = () => {
    const blob = new Blob([editedSchedule], {
      type: 'text/csv;charset=utf-8;',
    });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'shift-schedule.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!result) {
    return (
      <Card className="flex-1 lg:flex-[2] h-full shadow-sm">
        <CardHeader>
          <CardTitle>Generated Schedule</CardTitle>
          <CardDescription>
            Your generated schedule and AI analysis will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center text-muted-foreground h-[calc(100%-7rem)]">
          <p>Waiting for configuration...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-6 flex-1 lg:flex-[2]">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Generated Schedule</CardTitle>
            <CardDescription>
              Review, edit, and export the schedule.
            </CardDescription>
          </div>
          <Button onClick={handleExport} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </CardHeader>
        <CardContent>
          <Textarea
            value={editedSchedule}
            onChange={e => setEditedSchedule(e.target.value)}
            className="min-h-[300px] font-mono text-sm bg-background/50"
            placeholder="Your schedule..."
            aria-label="Generated shift schedule"
          />
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>AI Schedule Analysis</CardTitle>
          <CardDescription>
            AI-identified issues and suggestions for improvement.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2 flex items-center text-destructive">
              <AlertTriangle className="mr-2 h-4 w-4" />
              Potential Issues
            </h3>
            <ScrollArea className="h-40 rounded-md border p-4 bg-background/50">
              {result.analysis.issues.length > 0 ? (
                <ul className="space-y-2 list-disc pl-5">
                  {result.analysis.issues.map((issue, index) => (
                    <li key={index} className="text-sm">
                      {issue}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No issues found.
                </p>
              )}
            </ScrollArea>
          </div>
          <Separator />
          <div>
            <h3 className="font-semibold mb-2 flex items-center text-primary">
              <ListChecks className="mr-2 h-4 w-4" />
              Suggestions
            </h3>
            <ScrollArea className="h-40 rounded-md border p-4 bg-background/50">
              {result.analysis.suggestions.length > 0 ? (
                <ul className="space-y-2 list-disc pl-5">
                  {result.analysis.suggestions.map((suggestion, index) => (
                    <li key={index} className="text-sm">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground p-4 text-center">
                  No suggestions provided.
                </p>
              )}
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
