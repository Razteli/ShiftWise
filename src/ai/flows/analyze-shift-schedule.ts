'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a shift schedule and identifying potential issues.
 *
 * - analyzeShiftSchedule - A function that analyzes the shift schedule and returns potential issues.
 * - AnalyzeShiftScheduleInput - The input type for the analyzeShiftSchedule function.
 * - AnalyzeShiftScheduleOutput - The return type for the analyzeShiftSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { AnalyzeShiftScheduleOutputSchema } from '@/ai/schemas';

const AnalyzeShiftScheduleInputSchema = z.object({
  schedule: z
    .string()
    .describe('The shift schedule in a CSV-compatible format.'),
  employees: z
    .string()
    .describe(
      'A JSON string representing the list of employees, including their name and status.'
    ),
  employeesPerShift: z
    .string()
    .describe(
      'A JSON string representing the number of employees required for each shift (morning, afternoon, night).'
    ),
  monthlyOffDays: z
    .number()
    .optional()
    .describe('The maximum number of off days per employee in a month.'),
  customRule: z
    .string()
    .optional()
    .describe('Additional custom rules provided by the user.'),
});
export type AnalyzeShiftScheduleInput = z.infer<
  typeof AnalyzeShiftScheduleInputSchema
>;

export type AnalyzeShiftScheduleOutput = z.infer<
  typeof AnalyzeShiftScheduleOutputSchema
>;

export async function analyzeShiftSchedule(
  input: AnalyzeShiftScheduleInput
): Promise<AnalyzeShiftScheduleOutput> {
  return analyzeShiftScheduleFlow(input);
}

const analyzeShiftSchedulePrompt = ai.definePrompt({
  name: 'analyzeShiftSchedulePrompt',
  input: {schema: AnalyzeShiftScheduleInputSchema},
  output: {schema: AnalyzeShiftScheduleOutputSchema},
  prompt: `Anda adalah seorang analis jadwal shift. Analisis jadwal shift yang dibuat dan identifikasi potensi masalah seperti kelebihan beban karyawan, kekurangan atau kelebihan staf selama shift, dan distribusi beban kerja yang tidak adil. Berikan saran untuk menyelesaikan masalah ini.

Jadwal Shift yang Dihasilkan: {{{schedule}}}
Karyawan (JSON): {{{employees}}}
Karyawan yang Dibutuhkan per Shift (JSON): {{{employeesPerShift}}}

Analisis Anda harus memeriksa:
1. Kekurangan atau kelebihan staf pada hari apa pun untuk shift apa pun, berdasarkan jumlah karyawan yang dibutuhkan.
2. Keseimbangan beban kerja antar karyawan.

{{#if monthlyOffDays}}
3. Jumlah hari libur maksimum: Setiap karyawan tidak boleh memiliki lebih dari {{monthlyOffDays}} hari libur. Periksa apakah aturan ini terpenuhi.
{{/if}}

{{#if customRule}}
Pengguna juga memberikan aturan khusus ini yang seharusnya diikuti: {{{customRule}}}
Analisis Anda harus memeriksa apakah jadwal yang dihasilkan mematuhi aturan ini.
{{/if}}

Berdasarkan semua informasi ini, berikan analisis Anda dalam Bahasa Indonesia dalam format JSON yang telah ditentukan.`,
});

const analyzeShiftScheduleFlow = ai.defineFlow(
  {
    name: 'analyzeShiftScheduleFlow',
    inputSchema: AnalyzeShiftScheduleInputSchema,
    outputSchema: AnalyzeShiftScheduleOutputSchema,
  },
  async input => {
    const {output} = await analyzeShiftSchedulePrompt(input);
    return output!;
  }
);
