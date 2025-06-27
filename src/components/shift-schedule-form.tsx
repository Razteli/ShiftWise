'use client';

import { useTransition } from 'react';
import { useForm } from 'react-hook-form';
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
import { Loader2, Wand2 } from 'lucide-react';
import {
  generateAndAnalyzeSchedule,
  type ScheduleResult,
} from '@/app/actions';
import { scheduleConfigSchema, type ScheduleConfig } from '@/lib/schemas';

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
      juniorEmployees: 10,
      intermediateEmployees: 5,
      seniorEmployees: 2,
      shiftPatterns: 'Morning, Afternoon, Night',
      hoursPerDay: 8,
    },
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
    <Card className="flex-1 lg:max-w-md h-fit shadow-sm sticky top-20">
      <CardHeader>
        <CardTitle>Shift Configuration</CardTitle>
        <CardDescription>
          Set up the parameters for your shift schedule.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <FormLabel>Employee Classes</FormLabel>
              <FormDescription className="text-xs mb-2">
                Number of employees per class.
              </FormDescription>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border rounded-lg bg-background/50">
                <FormField
                  control={form.control}
                  name="juniorEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Junior</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="intermediateEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intermediate</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seniorEmployees"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senior</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

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
      </CardContent>
    </Card>
  );
}
