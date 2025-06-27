'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from './ui/separator';
import { Download, ListChecks, AlertTriangle } from 'lucide-react';
import type { ScheduleResult } from '@/app/actions';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface ScheduleDisplayProps {
  result: ScheduleResult | null;
}

const getShiftBadgeVariant = (
  shift: string
): 'default' | 'secondary' | 'outline' | 'destructive' => {
  const lowerShift = shift.toLowerCase().trim();
  if (lowerShift.includes('pagi')) return 'default';
  if (lowerShift.includes('siang')) return 'secondary';
  if (lowerShift.includes('malam')) return 'destructive';
  if (lowerShift.includes('libur')) return 'outline';
  return 'secondary';
};

export function ScheduleDisplay({ result }: ScheduleDisplayProps) {
  const handleExport = () => {
    if (!result?.schedule) return;

    const blob = new Blob([result.schedule], {
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

  const scheduleData = React.useMemo(() => {
    if (!result?.schedule) return null;
    try {
      const lines = result.schedule.trim().split('\n').filter(Boolean);
      if (lines.length < 2) return null;

      const headers = lines[0].split(',').map((h) => h.trim());
      const rows = lines
        .slice(1)
        .map((line) => line.split(',').map((cell) => cell.trim()));

      if (rows.some((row) => row.length !== headers.length)) {
        return null;
      }

      return { headers, rows };
    } catch (error) {
      console.error('Failed to parse schedule CSV', error);
      return null;
    }
  }, [result?.schedule]);

  if (!result) {
    return (
      <Card className="h-full shadow-sm">
        <CardHeader>
          <CardTitle>Generated Schedule & Analysis</CardTitle>
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
    <div>
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="schedule">Generated Schedule</TabsTrigger>
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>
                  Review and export the generated schedule.
                </CardDescription>
              </div>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={!scheduleData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {scheduleData ? (
                <ScrollArea className="w-full whitespace-nowrap rounded-md border">
                  <Table className="min-w-full">
                    <TableHeader>
                      <TableRow>
                        {scheduleData.headers.map((header, index) => (
                          <TableHead
                            key={index}
                            className={
                              index === 0 ? 'sticky left-0 bg-card z-10' : ''
                            }
                          >
                            {header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {scheduleData.rows.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          {row.map((cell, cellIndex) => (
                            <TableCell
                              key={cellIndex}
                              className={
                                cellIndex === 0
                                  ? 'font-medium sticky left-0 bg-card z-10'
                                  : 'text-center'
                              }
                            >
                              {cellIndex === 0 ? (
                                cell
                              ) : (
                                <Badge variant={getShiftBadgeVariant(cell)}>
                                  {cell}
                                </Badge>
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="flex items-center justify-center text-muted-foreground min-h-[500px]">
                  <p>Could not display schedule. Invalid format received.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
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
                <ScrollArea className="h-60 rounded-md border p-4 bg-background/50">
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
                <ScrollArea className="h-60 rounded-md border p-4 bg-background/50">
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
        </TabsContent>
      </Tabs>
    </div>
  );
}
