import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  status: z.enum(['active', 'on_leave', 'day_off']),
  level: z.enum(['junior', 'intermediate', 'senior']),
});

export type Employee = z.infer<typeof employeeSchema>;

export const scheduleConfigSchema = z.object({
  employees: z.array(employeeSchema).min(1, 'At least one employee is required.'),
  shiftPatterns: z.string().min(1, 'Shift patterns are required'),
  hoursPerDay: z.coerce
    .number()
    .min(1, 'Must be at least 1')
    .max(24, 'Cannot exceed 24'),
});

export type ScheduleConfig = z.infer<typeof scheduleConfigSchema>;
