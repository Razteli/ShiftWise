import { z } from 'zod';

export const employeeSchema = z.object({
  name: z.string().min(1, 'Name is required.'),
  status: z.enum(['aktif', 'cuti', 'libur']),
  level: z.enum(['junior', 'intermediate', 'senior']),
});

export type Employee = z.infer<typeof employeeSchema>;

export const scheduleConfigSchema = z
  .object({
    employees: z
      .array(employeeSchema)
      .min(1, 'At least one employee is required.'),
    shiftCycle: z
      .object({
        morning: z.coerce.number().int().min(0, 'Must be 0 or more.'),
        afternoon: z.coerce.number().int().min(0, 'Must be 0 or more.'),
        night: z.coerce.number().int().min(0, 'Must be 0 or more.'),
        off: z.coerce.number().int().min(0, 'Must be 0 or more.'),
      })
      .refine(
        cycle => cycle.morning + cycle.afternoon + cycle.night + cycle.off > 0,
        {
          message: 'At least one shift cycle day must be configured.',
          path: ['morning'],
        }
      ),
    employeesPerShift: z.object({
      morning: z.coerce.number().int().min(0, 'Must be 0 or more.'),
      afternoon: z.coerce.number().int().min(0, 'Must be 0 or more.'),
      night: z.coerce.number().int().min(0, 'Must be 0 or more.'),
    }),
    startDate: z.date({ required_error: 'Start date is required.' }),
    endDate: z.date({ required_error: 'End date is required.' }),
    customRule: z.string().optional(),
    scheduleDocument: z.string().optional(), // for the data URI
  })
  .refine(data => data.endDate >= data.startDate, {
    message: 'End date cannot be before start date.',
    path: ['endDate'],
  });

export type ScheduleConfig = z.infer<typeof scheduleConfigSchema>;
