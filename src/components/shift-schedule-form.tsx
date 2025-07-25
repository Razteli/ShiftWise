'use client';

import { useState, useTransition, useEffect, useMemo } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from '@/hooks/use-toast';
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
  FormDescription,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  CalendarIcon,
  Loader2,
  Wand2,
  Plus,
  Trash,
  Pencil,
} from 'lucide-react';
import {
  generateAndAnalyzeSchedule,
  type ScheduleResult,
} from '@/app/actions';
import {
  scheduleConfigSchema,
  type ScheduleConfig,
  employeeSchema,
  type Employee,
} from '@/lib/schemas';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Textarea } from './ui/textarea';

interface ShiftScheduleFormProps {
  onScheduleGenerated: (result: ScheduleResult, config: ScheduleConfig) => void;
  schedule: string | null;
}

const defaultEmployee: Omit<Employee, 'name'> = {
  remainingLeave: 12,
};

const LOCAL_STORAGE_KEY = 'shiftwise-form-config-v5';

export function ShiftScheduleForm({
  onScheduleGenerated,
  schedule,
}: ShiftScheduleFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isEmployeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState<
    number | null
  >(null);
  const [currentEmployee, setCurrentEmployee] =
    useState<Partial<Employee>>(defaultEmployee);
  const [dialogErrors, setDialogErrors] = useState<Partial<Employee>>({});

  const form = useForm<ScheduleConfig>({
    resolver: zodResolver(scheduleConfigSchema),
    defaultValues: {
      employees: [
        { name: 'Alice', remainingLeave: 12 },
        { name: 'Bob', remainingLeave: 12 },
        { name: 'Charlie', remainingLeave: 12 },
        { name: 'David', remainingLeave: 12 },
        { name: 'Eve', remainingLeave: 12 },
      ],
      employeesPerShift: {
        morning: 1,
        afternoon: 1,
        night: 1,
      },
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 29)),
      monthlyOffDays: 8,
      customRule: '',
    },
  });

  const offDayCounts = useMemo(() => {
    const counts = new Map<string, number>();
    if (!schedule) {
      return counts;
    }
    try {
      const lines = schedule.trim().split('\n').filter(Boolean);
      if (lines.length < 2) return counts;

      // Start from 1 to skip header
      for (let i = 1; i < lines.length; i++) {
        const cells = lines[i].split(',').map(cell => cell.trim());
        const employeeName = cells[0];
        if (employeeName) {
          const offDays = cells
            .slice(1)
            .filter(cell => cell.toLowerCase() === 'libur').length;
          counts.set(employeeName, offDays);
        }
      }
    } catch (error) {
      console.error('Failed to parse schedule for off-day counts', error);
    }
    return counts;
  }, [schedule]);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const savedDataJSON = window.localStorage.getItem(LOCAL_STORAGE_KEY);
        if (savedDataJSON) {
          const savedData = JSON.parse(savedDataJSON);
          const valuesToLoad = {
            ...savedData,
            // Convert date strings back to Date objects
            startDate: savedData.startDate
              ? new Date(savedData.startDate)
              : new Date(),
            endDate: savedData.endDate
              ? new Date(savedData.endDate)
              : new Date(new Date().setDate(new Date().getDate() + 29)),
          };
          form.reset(valuesToLoad);
        }
      }
    } catch (error) {
      console.error('Failed to load form data from localStorage', error);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      }
    }
    // We only want this to run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    const subscription = form.watch(value => {
      try {
        if (typeof window !== 'undefined') {
          const valueToSave = { ...value };
          window.localStorage.setItem(
            LOCAL_STORAGE_KEY,
            JSON.stringify(valueToSave)
          );
        }
      } catch (error) {
        console.error('Failed to save form data to localStorage', error);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: 'employees',
  });

  const handleAddNewEmployee = () => {
    setEditingEmployeeIndex(null);
    setCurrentEmployee({ name: '', ...defaultEmployee });
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

  const onSubmit = (values: ScheduleConfig) => {
    startTransition(async () => {
      const { data, error } = await generateAndAnalyzeSchedule(values);
      if (error) {
        toast({
          title: 'Error',
          description: error,
          variant: 'destructive',
        });
      } else if (data) {
        onScheduleGenerated(data, values);
        toast({
          title: 'Success!',
          description: 'Your shift schedule has been generated.',
        });
      }
    });
  };

  return (
    <div className="h-fit sticky top-20 bg-background z-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
              <CardDescription>
                Add, remove, and configure your employees.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative max-h-60 overflow-y-auto rounded-md border">
                  <Table>
                    <TableHeader className="sticky top-0 z-10 bg-card">
                      <TableRow>
                        <TableHead className="w-10 text-center">No.</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Sisa Cuti</TableHead>
                        <TableHead>Libur (Jadwal)</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fields.map((field, index) => {
                        const liburDiJadwal = offDayCounts.get(field.name) ?? 0;
                        return (
                          <TableRow key={field.id}>
                            <TableCell className="text-center">{index + 1}</TableCell>
                            <TableCell className="font-medium">
                              {field.name}
                            </TableCell>
                            <TableCell className="text-center">
                              {field.remainingLeave ?? '-'}
                            </TableCell>
                            <TableCell className="text-center">
                              {offDayCounts.has(field.name)
                                ? liburDiJadwal
                                : '-'}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditEmployee(index)}
                                className="h-8 w-8"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                                className="h-8 w-8 text-destructive/80 hover:text-destructive"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleAddNewEmployee}
                >
                  <Plus className="mr-2" />
                  Add Employee
                </Button>
                <FormMessage>
                  {form.formState.errors.employees?.root?.message ||
                    form.formState.errors.employees?.message}
                </FormMessage>
              </div>
            </CardContent>
          </Card>

          <Dialog
            open={isEmployeeDialogOpen}
            onOpenChange={setEmployeeDialogOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployeeIndex !== null
                    ? 'Edit Employee'
                    : 'Add Employee'}
                </DialogTitle>
                <DialogDescription>
                  Enter the details for the employee here. Click save when
                  you're done.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="name"
                      value={currentEmployee.name}
                      onChange={e =>
                        setCurrentEmployee({
                          ...currentEmployee,
                          name: e.target.value,
                        })
                      }
                      className="w-full"
                    />
                    {dialogErrors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {dialogErrors.name}
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="remainingLeave" className="text-right">
                    Sisa Cuti
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="remainingLeave"
                      type="number"
                      value={currentEmployee.remainingLeave ?? ''}
                      onChange={e =>
                        setCurrentEmployee({
                          ...currentEmployee,
                          remainingLeave:
                            e.target.value === ''
                              ? undefined
                              : Number(e.target.value),
                        })
                      }
                      className="w-full"
                      placeholder="Contoh: 12"
                    />
                    {dialogErrors.remainingLeave && (
                      <p className="text-sm text-destructive mt-1">
                        {dialogErrors.remainingLeave}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleSaveEmployee}>
                  Save changes
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Shift Configuration</CardTitle>
              <CardDescription>
                Define the shift structure and rules.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <FormItem>
                  <FormLabel>Employees per Shift</FormLabel>
                  <FormDescription className="text-xs !mt-0">
                    Set the number of employees required for each shift.
                  </FormDescription>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    <FormField
                      control={form.control}
                      name="employeesPerShift.morning"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal text-sm">
                            Pagi
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employeesPerShift.afternoon"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal text-sm">
                            Siang
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employeesPerShift.night"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-normal text-sm">
                            Malam
                          </FormLabel>
                          <FormControl>
                            <Input type="number" min="0" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormMessage>
                    {form.formState.errors.employeesPerShift?.root?.message}
                  </FormMessage>
                </FormItem>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Start Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>End Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full pl-3 text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                {field.value ? (
                                  format(field.value, 'PPP')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={date =>
                                date < form.getValues('startDate')
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="monthlyOffDays"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jumlah Maksimal Hari Libur per Bulan</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          placeholder="Contoh: 8"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Atur jumlah maksimal hari libur yang dapat diterima setiap karyawan dalam sebulan.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="customRule"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Rules</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., 'Alice cannot work night shifts', 'Ensure at least one senior is on duty during weekends'."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Add any specific constraints or rules for the AI to
                        consider.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            Generate Schedule with AI
          </Button>
        </form>
      </Form>
    </div>
  );
}
