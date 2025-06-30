/**
 * @fileOverview Shared Zod schemas for AI flows.
 */
import {z} from 'genkit';

export const AnalyzeShiftScheduleOutputSchema = z.object({
  issues: z
    .array(z.string())
    .describe('Daftar masalah yang teridentifikasi dalam jadwal shift.'),
  suggestions: z
    .array(z.string())
    .describe(
      'Daftar saran untuk menyelesaikan masalah yang teridentifikasi.'
    ),
});
