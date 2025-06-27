'use client';

import { useState, useTransition } from 'react';
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
import { Loader2, Wand2, Plus, Trash, Pencil } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from './ui/badge';

interface ShiftScheduleFormProps {
  onScheduleGenerated: (result: ScheduleResult) => void;
}

const defaultEmployee: Employee = {
  name: '',
  level: 'junior',
  status: 'active',
};

export function ShiftScheduleForm({
  onScheduleGenerated,
}: ShiftScheduleFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const [isEmployeeDialogOpen, setEmployeeDialogOpen] = useState(false);
  const [editingEmployeeIndex, setEditingEmployeeIndex] = useState<
    number | null
  >(null);
  const [currentEmployee, setCurrentEmployee] =
    useState<Employee>(defaultEmployee);
  const [dialogErrors, setDialogErrors] = useState<Partial<Employee>>({});

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
      shiftPatterns: 'Morning, Afternoon, Night',
      hoursPerDay: 8,
    },
  });

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
        onScheduleGenerated(data);
        toast({
          title: 'Success!',
          description: 'Your shift schedule has been generated.',
        });
      }
    });
  };

  return (
    <div className="flex-1 lg:max-w-md h-fit sticky top-20">
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
                <div className="rounded-md border">
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
                          <TableCell className="font-medium">
                            {field.name}
                          </TableCell>
                          <TableCell className="capitalize">
                            {field.level}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                field.status === 'active'
                                  ? 'secondary'
                                  : 'outline'
                              }
                              className="capitalize"
                            >
                              {field.status.replace('_', ' ')}
                            </Badge>
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
                      ))}
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
                  Enter the details for the employee here. Click save when you're
                  done.
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
                  <Label htmlFor="level" className="text-right">
                    Level
                  </Label>
                  <Select
                    value={currentEmployee.level}
                    onValueChange={(value: Employee['level']) =>
                      setCurrentEmployee({ ...currentEmployee, level: value })
                    }
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Select level" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <Select
                    value={currentEmployee.status}
                    onValueChange={(value: Employee['status']) =>
                      setCurrentEmployee({ ...currentEmployee, status: value })
                    }
                  >
                    <FormControl className="col-span-3">
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="on_leave">On Leave</SelectItem>
                      <SelectItem value="day_off">Day Off</SelectItem>
                    </SelectContent>
                  </Select>
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
                <FormField
                  control={form.control}
                  name="shiftPatterns"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shift Patterns</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Morning, Afternoon, Night"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription className="text-xs">
                        Comma-separated list of shift names.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="hoursPerDay"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hours per Shift</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
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
