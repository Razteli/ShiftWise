import { z } from "zod";

export const scheduleConfigSchema = z
  .object({
    juniorEmployees: z.coerce.number().min(0, 'Must be 0 or more'),
    intermediateEmployees: z.coerce.number().min(0, 'Must be 0 or more'),
    seniorEmployees: z.coerce.number().min(0, 'Must be 0 or more'),
    shiftPatterns: z.string().min(1, 'Shift patterns are required'),
    hoursPerDay: z.coerce
      .number()
      .min(1, 'Must be at least 1')
      .max(24, 'Cannot exceed 24'),
  })
  .refine(
    async (data) =>
      data.juniorEmployees + data.intermediateEmployees + data.seniorEmployees >
      0,
    {
      message: 'There must be at least one employee.',
      path: ['juniorEmployees'],
    }
  );

export type ScheduleConfig = z.infer<typeof scheduleConfigSchema>;
