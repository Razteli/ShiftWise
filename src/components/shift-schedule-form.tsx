'use client';

import { useTransition } from 'react';
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
import { Input } from '@/components/ui/input';
import { Loader2, Wand2, Plus, Trash } from 'lucide-react';
import {
  generateAndAnalyzeSchedule,
  type ScheduleResult,
} from '@/app/actions';
import { scheduleConfigSchema, type ScheduleConfig } from '@/lib/schemas';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ShiftScheduleFormProps {
  onScheduleGenerated: (result: ScheduleResult) => void;
}

export function ShiftScheduleForm({
  onScheduleGenerated,
}: ShiftScheduleFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'employees',
  });

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
                <div className="flex justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({ name: '', level: 'junior', status: 'active' })
                    }
                  >
                    <Plus className="mr-2" />
                    Add Employee
                  </Button>
                </div>

                <div className="space-y-4 max-h-72 overflow-y-auto p-1">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="flex items-end gap-2 p-3 border rounded-lg bg-background/50"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 flex-grow">
                        <FormField
                          control={form.control}
                          name={`employees.${index}.name`}
                          render={({ field }) => (
                            <FormItem className="col-span-2">
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Employee Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`employees.${index}.level`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Level</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select level" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="junior">Junior</SelectItem>
                                  <SelectItem value="intermediate">
                                    Intermediate
                                  </SelectItem>
                                  <SelectItem value="senior">Senior</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`employees.${index}.status`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="active">Active</SelectItem>
                                  <SelectItem value="on_leave">
                                    On Leave
                                  </SelectItem>
                                  <SelectItem value="day_off">
                                    Day Off
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => remove(index)}
                      >
                        <Trash />
                        <span className="sr-only">Remove employee</span>
                      </Button>
                    </div>
                  ))}
                </div>
                <FormMessage>
                  {form.formState.errors.employees?.root?.message}
                </FormMessage>
              </div>
            </CardContent>
          </Card>

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
