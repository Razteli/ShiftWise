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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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

  const handleExportCsv = () => {
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

  const handleExportPdf = () => {
    if (!editableScheduleData) return;

    // Folio size: 330mm x 216mm (13" x 8.5")
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: [330, 216],
    });

    doc.setFontSize(16);
    doc.text('Jadwal Shift Karyawan', 14, 15);

    autoTable(doc, {
      head: [editableScheduleData.headers],
      body: editableScheduleData.rows,
      startY: 20,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 2,
        valign: 'middle',
        halign: 'center',
      },
      headStyles: {
        fillColor: [63, 81, 181], // Primary color
        textColor: 255,
        fontStyle: 'bold',
      },
      columnStyles: {
        0: {
          // Employee name column
          halign: 'left',
          fontStyle: 'bold',
          minCellWidth: 30,
        },
      },
      willDrawCell: data => {
        // Prevent autoTable from drawing text for shift cells.
        // We will draw the colored background in didDrawCell.
        if (data.column.index > 0 && data.section === 'body') {
          data.cell.text = [''];
        }
      },
      didDrawCell: data => {
        if (data.column.index > 0 && data.section === 'body') {
          // Get the original text from the raw source
          const cellText = String(data.cell.raw).toLowerCase().trim();
          let fillColor: [number, number, number] | undefined;

          if (cellText.includes('pagi')) {
            fillColor = [63, 81, 181]; // Primary color (blue-ish)
          } else if (cellText.includes('siang')) {
            fillColor = [250, 235, 215]; // A light orange/peach color for secondary
          } else if (cellText.includes('malam')) {
            fillColor = [220, 53, 69]; // Destructive color (red)
          } else if (cellText.includes('libur')) {
            fillColor = [248, 249, 250]; // A very light grey for outline
          }

          if (fillColor) {
            doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
            doc.rect(
              data.cell.x,
              data.cell.y,
              data.cell.width,
              data.cell.height,
              'F'
            );
          }
        }
      },
    });

    // Add legend after the table
    const finalY = (doc as any).lastAutoTable.finalY;
    const legendY = finalY > 0 ? finalY + 10 : 20;
    doc.setFontSize(10);
    doc.text('Keterangan:', 14, legendY);

    const legendItems = [
      { text: 'Pagi', color: [63, 81, 181] },
      { text: 'Siang', color: [250, 235, 215] },
      { text: 'Malam', color: [220, 53, 69] },
      { text: 'Libur', color: [248, 249, 250] },
    ];

    let legendX = 14;
    const legendItemY = legendY + 5;
    const boxSize = 4;
    const itemGap = 35;

    legendItems.forEach(item => {
      doc.setFillColor(item.color[0], item.color[1], item.color[2]);
      doc.setDrawColor(0); // Black border for the box
      doc.rect(legendX, legendItemY, boxSize, boxSize, 'FD'); // FD is Fill and Draw (stroke)
      doc.setTextColor(0, 0, 0); // Reset text color to black
      doc.text(item.text, legendX + boxSize + 2, legendItemY + boxSize - 1);
      legendX += itemGap;
    });

    doc.save('shift-schedule.pdf');
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
          <TabsTrigger value="schedule">Jadwal yang Dihasilkan</TabsTrigger>
          <TabsTrigger value="analysis">Analisis AI</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <div>
                <CardTitle>Jadwal</CardTitle>
                <CardDescription>
                  Tinjau, edit, dan ekspor jadwal yang dihasilkan.
                </CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!editableScheduleData}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleExportCsv}>
                    Export as CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPdf}>
                    Export as PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {editableScheduleData ? (
                <div
                  className="relative w-full overflow-auto rounded-md border"
                  style={{ maxHeight: '70vh' }}
                >
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {editableScheduleData.headers.map((header, index) => (
                          <TableHead
                            key={index}
                            className={cn(
                              'whitespace-nowrap bg-card p-2',
                              index === 0
                                ? 'sticky left-0 z-10 font-medium'
                                : 'text-center'
                            )}
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
                              className={cn(
                                'p-0',
                                cellIndex === 0
                                  ? 'sticky left-0 z-10 bg-card p-2 font-medium'
                                  : 'text-center'
                              )}
                            >
                              {cellIndex === 0 ? (
                                <span className="whitespace-nowrap">
                                  {cell}
                                </span>
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
                                        'm-1 cursor-pointer hover:opacity-80 transition-opacity w-20 justify-center'
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
                </div>
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
                  <CardTitle>Analisis Jadwal AI</CardTitle>
                  <CardDescription>
                    Masalah dan saran perbaikan yang diidentifikasi oleh AI.
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
                  Potensi Masalah
                </h3>
                <div className="h-60 rounded-md border p-4 bg-background/50 overflow-y-auto">
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
                      Tidak ada masalah ditemukan.
                    </p>
                  )}
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-2 flex items-center text-primary">
                  <ListChecks className="mr-2 h-4 w-4" />
                  Saran
                </h3>
                <div className="h-60 rounded-md border p-4 bg-background/50 overflow-y-auto">
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
                      Tidak ada saran yang diberikan.
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
