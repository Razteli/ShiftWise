
'use client';

import * as React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Download,
  Calendar as CalendarIcon,
  Trash,
  Plus,
  Pencil,
} from 'lucide-react';
import {
  manualScheduleSchema,
  type ManualScheduleFormValues,
  employeeSchema,
  type Employee,
} from '@/lib/schemas';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge, badgeVariants } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { differenceInDays, format } from 'date-fns';
import { Calendar } from './ui/calendar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const SHIFT_OPTIONS = ['Pagi', 'Siang', 'Malam', 'Libur'];
const DEFAULT_SHIFT = 'Libur';
const LOCAL_STORAGE_KEY_MANUAL = 'shiftwise-manual-config-v1';

type ScheduleData = {
  headers: string[];
  rows: string[][];
};

const getShiftBadgeVariant = (
  shift: string
): 'default' | 'secondary' | 'outline' | 'destructive' | 'accent' => {
  const lowerShift = shift.toLowerCase().trim();
  if (lowerShift.includes('pagi')) return 'default';
  if (lowerShift.includes('siang')) return 'accent';
  if (lowerShift.includes('malam')) return 'destructive';
  if (lowerShift.includes('libur')) return 'outline';
  return 'secondary';
};

export function ManualScheduler() {
  const [scheduleData, setScheduleData] = React.useState<ScheduleData | null>(
    null
  );
  const [openPopoverMap, setOpenPopoverMap] = React.useState<
    Record<string, boolean>
  >({});
  const [isEmployeeDialogOpen, setEmployeeDialogOpen] = React.useState(false);
  const [editingEmployeeIndex, setEditingEmployeeIndex] = React.useState<
    number | null
  >(null);
  const [currentEmployee, setCurrentEmployee] = React.useState<Partial<Employee>>({});
  const [dialogErrors, setDialogErrors] = React.useState<Partial<Employee>>({});
  
  const statusMap: Record<Employee['status'], string> = {
    active: 'Aktif',
    on_leave: 'Cuti',
    day_off: 'Libur',
  };

  const form = useForm<ManualScheduleFormValues>({
    resolver: zodResolver(manualScheduleSchema),
    defaultValues: {
      employees: [
        { name: 'Karyawan 1', status: 'active', remainingLeave: 0 },
        { name: 'Karyawan 2', status: 'active', remainingLeave: 0 },
        { name: 'Karyawan 3', status: 'active', remainingLeave: 0 },
      ],
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 6)),
    },
  });
  
  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'employees',
  });

  const { watch } = form;
  const employees = watch('employees');
  const startDate = watch('startDate');
  const endDate = watch('endDate');


  React.useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedDataJSON = window.localStorage.getItem(LOCAL_STORAGE_KEY_MANUAL);
        if (savedDataJSON) {
          const savedData = JSON.parse(savedDataJSON);
          const valuesToLoad = {
            ...savedData,
            startDate: savedData.startDate ? new Date(savedData.startDate) : new Date(),
            endDate: savedData.endDate ? new Date(savedData.endDate) : new Date(new Date().setDate(new Date().getDate() + 6)),
          };
          form.reset(valuesToLoad);
        }
      }
    } catch (error) {
      console.error('Failed to load form data', error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    const subscription = form.watch(value => {
       try {
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(LOCAL_STORAGE_KEY_MANUAL, JSON.stringify(value));
        }
      } catch (error) {
        console.error('Failed to save form data', error);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  React.useEffect(() => {
    if (!startDate || !endDate) return;
    const numberOfDays = differenceInDays(endDate, startDate) + 1;
    if (numberOfDays <= 0 || employees.length === 0) {
      setScheduleData(null);
      return;
    }

    const headers = ['Karyawan', ...Array.from({ length: numberOfDays }, (_, i) => `Hari ${i + 1}`)];
    const rows = employees.map(emp => [emp.name, ...Array(numberOfDays).fill(DEFAULT_SHIFT)]);
    setScheduleData({ headers, rows });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [employees, startDate, endDate]);

  const handleAddNewEmployee = () => {
    setEditingEmployeeIndex(null);
    setCurrentEmployee({ name: '', status: 'active', remainingLeave: 0 });
    setDialogErrors({});
    setEmployeeDialogOpen(true);
  };

  const handleEditEmployee = (index: number) => {
    setEditingEmployeeIndex(index);
    setCurrentEmployee(fields[index]);
    setDialogErrors({});
    setEmployeeDialogOpen(true);
  };

  const handleSaveEmployee = () => {
    const result = employeeSchema.safeParse(currentEmployee);
    if (!result.success) {
      const errors: Partial<Employee> = {};
      result.error.issues.forEach(issue => {
        if (issue.path[0]) {
          errors[issue.path[0] as keyof Employee] = issue.message;
        }
      });
      setDialogErrors(errors);
      return;
    }
    if (editingEmployeeIndex !== null) {
      update(editingEmployeeIndex, result.data);
    } else {
      append(result.data);
    }
    setEmployeeDialogOpen(false);
  };
  
  const handleShiftChange = (rowIndex: number, cellIndex: number, newShift: string) => {
    setScheduleData(prevData => {
      if (!prevData) return null;
      const newRows = prevData.rows.map(r => [...r]);
      newRows[rowIndex][cellIndex] = newShift;
      return { ...prevData, rows: newRows };
    });
    setOpenPopoverMap({}); // Close all popovers
  };

  const convertDataToCsv = (data: ScheduleData): string => {
    const headers = data.headers.join(',');
    const rows = data.rows.map(row => row.join(',')).join('\n');
    return `${headers}\n${rows}`;
  };

  const handleExportCsv = () => {
    if (!scheduleData) return;
    const csvContent = convertDataToCsv(scheduleData);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', 'jadwal-manual.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPdf = () => {
    if (!scheduleData) return;
    const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    doc.setFontSize(16);
    doc.text('Jadwal Manual Karyawan', 14, 15);
    const pdfHeaders = scheduleData.headers.map(h => h.startsWith('Hari ') ? h.replace('Hari ', '') : h);

    autoTable(doc, {
      head: [pdfHeaders],
      body: scheduleData.rows,
      startY: 20,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2, valign: 'middle', halign: 'center' },
      headStyles: { fillColor: [63, 81, 181], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { halign: 'left', fontStyle: 'bold' } },
      didDrawCell: data => {
        if (data.column.index > 0 && data.section === 'body') {
          const cellText = String(data.cell.raw).toLowerCase().trim();
          let fillColor: [number, number, number] | undefined;
          if (cellText.includes('pagi')) fillColor = [63, 81, 181];
          else if (cellText.includes('siang')) fillColor = [255, 191, 0];
          else if (cellText.includes('malam')) fillColor = [220, 53, 69];
          else if (cellText.includes('libur')) fillColor = [248, 249, 250];

          if (fillColor) {
            doc.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
            doc.rect(data.cell.x, data.cell.y, data.cell.width, data.cell.height, 'F');
          }
        }
      },
    });
    doc.save('jadwal-manual.pdf');
  };

  return (
    <div>
        <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
                Pembuatan Jadwal Manual
            </h2>
            <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
                Atur karyawan dan rentang tanggal, lalu isi jadwal secara langsung di tabel.
            </p>
        </div>
        <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="lg:flex-1 lg:max-w-md w-full">
            <Form {...form}>
            <form className="space-y-6">
                <Card className="shadow-sm">
                    <CardHeader><CardTitle>1. Atur Karyawan & Tanggal</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                        <div className="relative max-h-60 overflow-y-auto rounded-md border">
                            <Table>
                                <TableHeader className="sticky top-0 bg-card">
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Aksi</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {fields.map((field, index) => (
                                    <TableRow key={field.id}>
                                    <TableCell className="font-medium">{field.name}</TableCell>
                                    <TableCell><Badge variant={field.status === 'active' ? 'secondary' : 'outline'} className="capitalize">{statusMap[field.status]}</Badge></TableCell>
                                    <TableCell className="text-right">
                                        <Button type="button" variant="ghost" size="icon" onClick={() => handleEditEmployee(index)} className="h-8 w-8"><Pencil className="h-4 w-4" /></Button>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-destructive/80 hover:text-destructive"><Trash className="h-4 w-4" /></Button>
                                    </TableCell>
                                    </TableRow>
                                ))}
                                </TableBody>
                            </Table>
                        </div>
                        <Button type="button" variant="outline" className="w-full" onClick={handleAddNewEmployee}><Plus className="mr-2" />Tambah Karyawan</Button>
                        <FormMessage>{form.formState.errors.employees?.root?.message || form.formState.errors.employees?.message}</FormMessage>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                            <FormField control={form.control} name="startDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Tanggal Mulai</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                    {field.value ? format(field.value, 'PPP') : <span>Pilih tanggal</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus/>
                                </PopoverContent></Popover><FormMessage />
                                </FormItem>
                            )}/>
                            <FormField control={form.control} name="endDate" render={({ field }) => (
                                <FormItem className="flex flex-col"><FormLabel>Tanggal Selesai</FormLabel>
                                <Popover><PopoverTrigger asChild><FormControl>
                                <Button variant={'outline'} className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
                                    {field.value ? format(field.value, 'PPP') : <span>Pilih tanggal</span>}
                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button></FormControl></PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar mode="single" selected={field.value} onSelect={field.onChange} disabled={(date) => date < form.getValues('startDate')} initialFocus />
                                </PopoverContent></Popover><FormMessage />
                                </FormItem>
                            )}/>
                        </div>
                    </CardContent>
                </Card>
            </form>
            </Form>

            <Dialog open={isEmployeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{editingEmployeeIndex !== null ? 'Edit Karyawan' : 'Tambah Karyawan'}</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama</Label>
                    <div className="col-span-3"><Input id="name" value={currentEmployee.name || ''} onChange={e => setCurrentEmployee(c => ({...c, name: e.target.value}))} />
                        {dialogErrors.name && <p className="text-sm text-destructive mt-1">{dialogErrors.name}</p>}
                    </div>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="status" className="text-right">Status</Label>
                    <div className="col-span-3"><Select value={currentEmployee.status} onValueChange={(v: Employee['status']) => setCurrentEmployee(c => ({...c, status: v}))}><SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="active">Aktif</SelectItem><SelectItem value="on_leave">Cuti</SelectItem><SelectItem value="day_off">Libur</SelectItem></SelectContent>
                        </Select>{dialogErrors.status && <p className="text-sm text-destructive mt-1">{dialogErrors.status}</p>}
                    </div>
                    </div>
                </div>
                <DialogFooter><Button type="button" onClick={handleSaveEmployee}>Simpan</Button></DialogFooter>
                </DialogContent>
            </Dialog>
            </div>

            <div className="lg:flex-[2] w-full min-w-0">
                <Card className="shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle>2. Isi Jadwal</CardTitle>
                        <CardDescription>Klik sel untuk mengubah shift.</CardDescription>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" disabled={!scheduleData}><Download className="mr-2 h-4 w-4" />Ekspor</Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={handleExportCsv}>Ekspor ke CSV</DropdownMenuItem>
                            <DropdownMenuItem onClick={handleExportPdf}>Ekspor ke PDF</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    </CardHeader>
                    <CardContent>
                    {scheduleData ? (
                        <div className="relative w-full overflow-auto rounded-md border" style={{ maxHeight: '70vh' }}>
                        <Table>
                            <TableHeader>
                            <TableRow>
                                {scheduleData.headers.map((header, index) => (
                                <TableHead key={index} className={cn('whitespace-nowrap bg-card p-2 text-center border-b border-r', index === 0 ? 'sticky left-0 top-0 z-30' : 'sticky top-0 z-20')}>
                                    {header}
                                </TableHead>
                                ))}
                            </TableRow>
                            </TableHeader>
                            <TableBody>
                            {scheduleData.rows.map((row, rowIndex) => (
                                <TableRow key={rowIndex}>
                                {row.map((cell, cellIndex) => (
                                    <TableCell key={cellIndex} className={cn('p-0 border-r', cellIndex === 0 ? 'sticky left-0 z-10 bg-card p-2 font-medium whitespace-nowrap' : 'text-center')}>
                                    {cellIndex === 0 ? ( <span>{cell}</span> ) : (
                                        <Popover open={openPopoverMap[`${rowIndex}-${cellIndex}`]} onOpenChange={isOpen => setOpenPopoverMap(p => ({ ...p, [`${rowIndex}-${cellIndex}`]: isOpen }))}>
                                        <PopoverTrigger asChild>
                                            <button className={cn(badgeVariants({ variant: getShiftBadgeVariant(cell) }), 'm-1 cursor-pointer hover:opacity-80 transition-opacity w-20 justify-center')}>
                                                {cell}
                                            </button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-2">
                                            <RadioGroup defaultValue={cell} onValueChange={newShift => handleShiftChange(rowIndex, cellIndex, newShift)}>
                                            <div className="space-y-2">
                                                {SHIFT_OPTIONS.map(option => (
                                                <div key={option} className="flex items-center space-x-2">
                                                    <RadioGroupItem value={option} id={`r-${rowIndex}-${cellIndex}-${option}`} />
                                                    <Label htmlFor={`r-${rowIndex}-${cellIndex}-${option}`}>{option}</Label>

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
                        <p>Atur karyawan dan tanggal untuk memulai.</p>
                        </div>
                    )}
                    </CardContent>
                </Card>
            </div>
        </div>
    </div>
  );
}
