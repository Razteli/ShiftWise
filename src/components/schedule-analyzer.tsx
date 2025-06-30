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
  Plus,
  Trash,
  Pencil,
  Bot,
  ListChecks,
  AlertTriangle,
} from 'lucide-react';
import {
  analyzeUploadedSchedule,
  type AnalyzeShiftScheduleOutput,
} from '@/app/actions';
import {
  scheduleConfigSchema,
  type ScheduleConfig,
  employeeSchema,
  type Employee,
} from '@/lib/schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from './ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar } from './ui/calendar';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';

const defaultEmployee: Employee = {
  name: '',
  level: 'junior',
  status: 'active',
};

const LOCAL_STORAGE_KEY_ANALYZER = 'shiftwise-analyzer-form-config-v1';

export function ScheduleAnalyzer() {
  const [isAnalyzing, startTransition] = useTransition();
  const { toast } = useToast();
  const [isEmployeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState<
    number | null
  >(null);
  const [currentEmployee, setCurrentEmployee] =
    useState<Employee>(defaultEmployee);
  const [dialogErrors, setDialogErrors] = useState<Partial<Employee>>({});
  const [analysisResult, setAnalysisResult] =
    useState<AnalyzeShiftScheduleOutput | null>(null);

  const statusMap: Record<Employee['status'], string> = {
    active: 'Aktif',
    on_leave: 'Cuti',
    day_off: 'Libur',
  };

  const form = useForm<ScheduleConfig>({
    resolver: zodResolver(scheduleConfigSchema),
    defaultValues: {
      employees: [
        { name: 'Alice', level: 'senior', status: 'active' },
        { name: 'Bob', level: 'intermediate', status: 'active' },
        { name: 'Charlie', level: 'intermediate', status: 'active' },
        { name: 'David', level: 'junior', status: 'active' },
        { name: 'Eve', level: 'junior', status: 'on_leave' },
      ],
      shiftCycle: { morning: 2, afternoon: 2, night: 2, off: 2 },
      employeesPerShift: { morning: 1, afternoon: 1, night: 1 },
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 29)),
      customRule: '',
      scheduleDocument: '',
    },
  });

  useEffect(() => {
    try {
      const savedDataJSON = window.localStorage.getItem(
        LOCAL_STORAGE_KEY_ANALYZER
      );
      if (savedDataJSON) {
        const savedData = JSON.parse(savedDataJSON);
        form.reset({
          ...savedData,
          startDate: savedData.startDate ? new Date(savedData.startDate) : new Date(),
          endDate: savedData.endDate ? new Date(savedData.endDate) : new Date(new Date().setDate(new Date().getDate() + 29)),
          scheduleDocument: '',
        });
      }
    } catch (error) {
      console.error('Failed to load analyzer form data', error);
    }
  }, [form]);

  useEffect(() => {
    const subscription = form.watch(value => {
      try {
        const valueToSave = { ...value };
        delete (valueToSave as Partial<ScheduleConfig>).scheduleDocument;
        window.localStorage.setItem(
          LOCAL_STORAGE_KEY_ANALYZER,
          JSON.stringify(valueToSave)
        );
      } catch (error) {
        console.error('Failed to save analyzer form data', error);
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
    setCurrentEmployee(defaultEmployee);
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue('scheduleDocument', reader.result as string, {
          shouldValidate: true,
        });
        toast({
          title: 'File Uploaded',
          description: `"${file.name}" has been selected for analysis.`,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (values: ScheduleConfig) => {
    if (!values.scheduleDocument) {
      toast({
        title: 'Error',
        description: 'Please upload a schedule image before analyzing.',
        variant: 'destructive',
      });
      return;
    }
    startTransition(async () => {
      setAnalysisResult(null);
      const { data, error } = await analyzeUploadedSchedule(values);
      if (error) {
        toast({ title: 'Error', description: error, variant: 'destructive' });
      } else if (data) {
        setAnalysisResult(data);
        toast({
          title: 'Success!',
          description: 'Your schedule has been analyzed.',
        });
      }
    });
  };

  return (
    <div>
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-primary">
          Analyze Existing Schedule
        </h2>
        <p className="text-lg text-muted-foreground mt-3 max-w-2xl mx-auto">
          Upload an image of your current schedule and let our AI provide insights and suggestions based on your configuration.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:max-w-md">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Employee Management */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>1. Employee Data</CardTitle>
                  <CardDescription>
                    Provide the same employee data used in the schedule.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="rounded-md border max-h-60 overflow-y-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {fields.map((field, index) => (
                            <TableRow key={field.id}>
                            <TableCell className="font-medium">{field.name}</TableCell>
                            <TableCell className="capitalize">{field.level}</TableCell>
                            <TableCell>
                                <Badge variant={field.status === 'active' ? 'secondary' : 'outline'} className="capitalize">
                                {statusMap[field.status]}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right p-1">
                                <Button type="button" variant="ghost" size="icon" onClick={() => handleEditEmployee(index)} className="h-8 w-8">
                                <Pencil className="h-4 w-4" />
                                </Button>
                                <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-destructive/80 hover:text-destructive">
                                <Trash className="h-4 w-4" />
                                </Button>
                            </TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                    </div>
                    <Button type="button" variant="outline" className="w-full mt-4" onClick={handleAddNewEmployee}>
                        <Plus className="mr-2" /> Add Employee
                    </Button>
                </CardContent>
              </Card>

              {/* Shift Configuration */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>2. Shift Configuration</CardTitle>
                  <CardDescription>
                    Define the rules the schedule should follow.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormItem>
                    <FormLabel>Employees per Shift</FormLabel>
                    <div className="grid grid-cols-3 gap-4 pt-2">
                        <FormField control={form.control} name="employeesPerShift.morning" render={({ field }) => ( <FormItem><FormLabel className="font-normal text-sm">Pagi</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="employeesPerShift.afternoon" render={({ field }) => ( <FormItem><FormLabel className="font-normal text-sm">Siang</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl></FormItem>)} />
                        <FormField control={form.control} name="employeesPerShift.night" render={({ field }) => ( <FormItem><FormLabel className="font-normal text-sm">Malam</FormLabel><FormControl><Input type="number" min="0" {...field} /></FormControl></FormItem>)} />
                    </div>
                  </FormItem>
                   <FormField control={form.control} name="customRule" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Rules</FormLabel>
                      <FormControl>
                        <Textarea placeholder="e.g., 'Alice cannot work night shifts'" className="resize-none" {...field} />
                      </FormControl>
                    </FormItem>
                  )} />
                </CardContent>
              </Card>
              
               {/* Upload */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle>3. Upload Schedule</CardTitle>
                  <CardDescription>
                    Upload an image of the schedule to be analyzed.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                     <FormField
                        control={form.control}
                        name="scheduleDocument"
                        render={() => (
                           <FormItem>
                            <FormControl>
                                <Input type="file" accept="image/*" onChange={handleFileChange} className="file:text-primary file:font-semibold" required/>
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </CardContent>
              </Card>

              <Button type="submit" className="w-full" disabled={isAnalyzing}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bot className="mr-2 h-4 w-4" />}
                Analyze Schedule with AI
              </Button>
            </form>
          </Form>
        </div>

        <div className="flex-1 w-full min-w-0">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>AI Analysis Results</CardTitle>
              <CardDescription>
                Issues and suggestions identified by the AI will appear here.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 min-h-[400px]">
              {isAnalyzing ? (
                 <div className="flex items-center justify-center text-muted-foreground h-full min-h-[300px]">
                    <Loader2 className="mr-2 h-6 w-6 animate-spin" />
                    <p>Analyzing your schedule...</p>
                 </div>
              ) : analysisResult ? (
                <>
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center text-destructive">
                      <AlertTriangle className="mr-2 h-4 w-4" /> Potensi Masalah
                    </h3>
                    <div className="h-60 rounded-md border p-4 bg-background/50 overflow-y-auto">
                      {analysisResult.issues.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {analysisResult.issues.map((issue, index) => (
                            <li key={index} className="text-sm">{issue}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">Tidak ada masalah ditemukan.</p>
                      )}
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center text-primary">
                      <ListChecks className="mr-2 h-4 w-4" /> Saran
                    </h3>
                    <div className="h-60 rounded-md border p-4 bg-background/50 overflow-y-auto">
                      {analysisResult.suggestions.length > 0 ? (
                        <ul className="space-y-2 list-disc pl-5">
                          {analysisResult.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm">{suggestion}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-muted-foreground p-4 text-center">Tidak ada saran yang diberikan.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center text-muted-foreground h-full min-h-[300px]">
                    <p>Please fill out the configuration and upload a schedule to begin.</p>
                 </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
       <Dialog open={isEmployeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingEmployeeIndex !== null ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
                <DialogDescription>Enter the details for the employee here. Click save when you're done.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">Name</Label>
                  <div className="col-span-3">
                    <Input id="name" value={currentEmployee.name} onChange={e => setCurrentEmployee({ ...currentEmployee, name: e.target.value })} className="w-full" />
                    {dialogErrors.name && <p className="text-sm text-destructive mt-1">{dialogErrors.name}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="level" className="text-right">Level</Label>
                  <div className="col-span-3">
                    <Select value={currentEmployee.level} onValueChange={(value: Employee['level']) => setCurrentEmployee({ ...currentEmployee, level: value })}>
                      <SelectTrigger id="level"><SelectValue placeholder="Select level" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="junior">Junior</SelectItem>
                        <SelectItem value="intermediate">Intermediate</SelectItem>
                        <SelectItem value="senior">Senior</SelectItem>
                      </SelectContent>
                    </Select>
                    {dialogErrors.level && <p className="text-sm text-destructive mt-1">{dialogErrors.level}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">Status</Label>
                  <div className="col-span-3">
                    <Select value={currentEmployee.status} onValueChange={(value: Employee['status']) => setCurrentEmployee({ ...currentEmployee, status: value })}>
                      <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="on_leave">Cuti</SelectItem>
                        <SelectItem value="day_off">Libur</SelectItem>
                      </SelectContent>
                    </Select>
                    {dialogErrors.status && <p className="text-sm text-destructive mt-1">{dialogErrors.status}</p>}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" onClick={handleSaveEmployee}>Save changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
    </div>
  );
}
