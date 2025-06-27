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
import {
  Download,
  ListChecks,
  AlertTriangle,
  Bot,
  Loader2,
} from 'lucide-react';
import { reanalyzeSchedule, type ScheduleResult } from '@/app/actions';
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
import { Badge, badgeVariants } from '@/components/ui/badge';
import type { ScheduleConfig } from '@/lib/schemas';
import { useToast } from '@/hooks/use-toast';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface ScheduleDisplayProps {
  result: ScheduleResult | null;
  config: ScheduleConfig | null;
}

type ScheduleData = {
  headers: string[];
  rows: string[][];
};

const SHIFT_OPTIONS = ['Pagi', 'Siang', 'Malam', 'Libur'];

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

export function ScheduleDisplay({ result, config }: ScheduleDisplayProps) {
  const { toast } = useToast();
  const [isReanalyzing, startReanalysis] = React.useTransition();
  const [openPopoverMap, setOpenPopoverMap] = React.useState<
    Record<string, boolean>
  >({});

  const [editableScheduleData, setEditableScheduleData] =
    React.useState<ScheduleData | null>(null);

  const [analysis, setAnalysis] =
    React.useState<ScheduleResult['analysis'] | null>(null);

  const originalScheduleData = React.useMemo(() => {
    if (!result?.schedule) return null;
    try {
      const lines = result.schedule.trim().split('\n').filter(Boolean);
      if (lines.length < 2) return null;

      const headers = lines[0].split(',').map(h => h.trim());
      const rows = lines
        .slice(1)
        .map(line => line.split(',').map(cell => cell.trim()));

      if (rows.some(row => row.length !== headers.length)) {
        return null;
      }

      return { headers, rows };
    } catch (error) {
      console.error('Failed to parse schedule CSV', error);
      return null;
    }
  }, [result?.schedule]);

  React.useEffect(() => {
    setEditableScheduleData(originalScheduleData);
    setAnalysis(result?.analysis ?? null);
  }, [originalScheduleData, result?.analysis]);

  const convertDataToCsv = (data: ScheduleData): string => {
    const headers = data.headers.join(',');
    const rows = data.rows.map(row => row.join(',')).join('\n');
    return `${headers}\n${rows}`;
  };

  const handleExport = () => {
    if (!editableScheduleData) return;
    const csvContent = convertDataToCsv(editableScheduleData);
    const blob = new Blob([csvContent], {
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

  const handleShiftChange = (
    rowIndex: number,
    cellIndex: number,
    newShift: string
  ) => {
    setEditableScheduleData(prevData => {
      if (!prevData) return null;
      const newRows = prevData.rows.map(r => [...r]);
      newRows[rowIndex][cellIndex] = newShift;
      return { ...prevData, rows: newRows };
    });
    setOpenPopoverMap({}); // Close all popovers
  };

  const scheduleHasChanged = React.useMemo(() => {
    if (!originalScheduleData || !editableScheduleData) return false;
    return (
      convertDataToCsv(originalScheduleData) !==
      convertDataToCsv(editableScheduleData)
    );
  }, [originalScheduleData, editableScheduleData]);

  const handleReanalyze = () => {
    if (!editableScheduleData || !config) return;
    const scheduleCsv = convertDataToCsv(editableScheduleData);

    startReanalysis(async () => {
      const { data, error } = await reanalyzeSchedule(scheduleCsv, config);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (data) {
        setAnalysis(data);
        toast({
          title: 'Success!',
          description: 'Schedule has been re-analyzed.',
        });
      }
    });
  };

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
                  Review, edit, and export the generated schedule.
                </CardDescription>
              </div>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                disabled={!editableScheduleData}
              >
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              {editableScheduleData ? (
                <ScrollArea className="w-full rounded-md border">
                  <Table className="min-w-full whitespace-nowrap">
                    <TableHeader>
                      <TableRow>
                        {editableScheduleData.headers.map((header, index) => (
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
                      {editableScheduleData.rows.map((row, rowIndex) => (
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
                                <Popover
                                  open={
                                    openPopoverMap[`${rowIndex}-${cellIndex}`]
                                  }
                                  onOpenChange={isOpen =>
                                    setOpenPopoverMap(prev => ({
                                      ...prev,
                                      [`${rowIndex}-${cellIndex}`]: isOpen,
                                    }))
                                  }
                                >
                                  <PopoverTrigger asChild>
                                    <button
                                      className={cn(
                                        badgeVariants({
                                          variant: getShiftBadgeVariant(cell),
                                        }),
                                        'cursor-pointer hover:opacity-80 transition-opacity w-20 justify-center'
                                      )}
                                    >
                                      {cell}
                                    </button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-2">
                                    <RadioGroup
                                      defaultValue={cell}
                                      onValueChange={newShift =>
                                        handleShiftChange(
                                          rowIndex,
                                          cellIndex,
                                          newShift
                                        )
                                      }
                                    >
                                      <div className="space-y-2">
                                        {SHIFT_OPTIONS.map(option => (
                                          <div
                                            key={option}
                                            className="flex items-center space-x-2"
                                          >
                                            <RadioGroupItem
                                              value={option}
                                              id={`r-${rowIndex}-${cellIndex}-${option}`}
                                            />
                                            <Label
                                              htmlFor={`r-${rowIndex}-${cellIndex}-${option}`}
                                            >
                                              {option}
                                            </Label>
                                          </div>
                                        ))}
                                      </div>
                                    </RadioGroup>
                                  </PopoverContent>
                                </Popover>
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
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>AI Schedule Analysis</CardTitle>
                  <CardDescription>
                    AI-identified issues and suggestions for improvement.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleReanalyze}
                  disabled={!scheduleHasChanged || isReanalyzing}
                  size="sm"
                  variant="outline"
                >
                  {isReanalyzing ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Bot className="mr-2 h-4 w-4" />
                  )}
                  Re-analyze
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 flex items-center text-destructive">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Potential Issues
                </h3>
                <ScrollArea className="h-60 rounded-md border p-4 bg-background/50">
                  {analysis && analysis.issues.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {analysis.issues.map((issue, index) => (
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
                  {analysis && analysis.suggestions.length > 0 ? (
                    <ul className="space-y-2 list-disc pl-5">
                      {analysis.suggestions.map((suggestion, index) => (
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
