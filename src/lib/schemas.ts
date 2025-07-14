import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  remainingLeave: z.coerce
    .number()
    .int()
    .min(0, 'Must be 0 or more.')
    .optional(),
});

export type Employee = z.infer<typeof employeeSchema>;

export const scheduleConfigSchema = z
  .object({
    employees: z
      .array(employeeSchema)
      .min(1, 'At least one employee is required.'),
    employeesPerShift: z.object({
      morning: z.coerce.number().int().min(0, 'Must be 0 or more.'),
      afternoon: z.coerce.number().int().min(0, 'Must be 0 or more.'),
      night: z.coerce.number().int().min(0, 'Must be 0 or more.'),
    }),
    startDate: z.date({ required_error: 'Start date is required.' }),
    endDate: z.date({ required_error: 'End date is required.' }),
    monthlyOffDays: z.coerce
      .number()
      .int()
      .min(0, 'Jumlah hari libur harus 0 atau lebih.')
      .optional(),
    customRule: z.string().optional(),
  })
  .refine(data => data.endDate >= data.startDate, {
    message: 'End date cannot be before start date.',
    path: ['endDate'],
  });

export type ScheduleConfig = z.infer<typeof scheduleConfigSchema>;

export const manualScheduleSchema = z.object({
  employees: z
      .array(employeeSchema)
      .min(1, 'At least one employee is required.'),
  startDate: z.date({ required_error: 'Start date is required.' }),
  endDate: z.date({ required_error: 'End date is required.' }),
}).refine(data => data.endDate >= data.startDate, {
    message: 'End date cannot be before start date.',
    path: ['endDate'],
});

export type ManualScheduleFormValues = z.infer<typeof manualScheduleSchema>;
