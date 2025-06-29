'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting shift schedules based on employee availability and requirements.
 *
 * - suggestShiftSchedule - A function that generates shift schedule suggestions.
 * - SuggestShiftScheduleInput - The input type for the suggestShiftSchedule function.
 * - SuggestShiftScheduleOutput - The return type for the suggestShiftSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestShiftScheduleInputSchema = z.object({
  employees: z
    .string()
    .describe(
      'A JSON string representing the list of employees, including their name, status (active, on_leave, day_off), and level (junior, intermediate, senior).'
    ),
  shiftCycle: z
    .string()
    .describe(
      'A JSON string representing the desired shift cycle configuration (e.g., {"morning": 2, "afternoon": 2, "night": 2, "off": 2}).'
    ),
  employeesPerShift: z
    .string()
    .describe(
      'A JSON string representing the number of employees required for each shift (morning, afternoon, night).'
    ),
  startDate: z
    .string()
    .describe('The start date for the schedule period in ISO format.'),
  endDate: z
    .string()
    .describe('The end date for the schedule period in ISO format.'),
  numberOfDays: z
    .number()
    .describe('The total number of days in the schedule period.'),
  customRule: z.string().optional().describe('Additional custom rules provided by the user.'),
});
export type SuggestShiftScheduleInput = z.infer<
  typeof SuggestShiftScheduleInputSchema
>;

const SuggestShiftScheduleOutputSchema = z.object({
  schedule: z
    .string()
    .describe('The suggested shift schedule in a CSV-compatible format.'),
});
export type SuggestShiftScheduleOutput = z.infer<
  typeof SuggestShiftScheduleOutputSchema
>;

export async function suggestShiftSchedule(
  input: SuggestShiftScheduleInput
): Promise<SuggestShiftScheduleOutput> {
  return suggestShiftScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestShiftSchedulePrompt',
  input: {schema: SuggestShiftScheduleInputSchema},
  output: {schema: SuggestShiftScheduleOutputSchema},
  prompt: `Anda adalah asisten penjadwalan AI. Tugas Anda adalah membuat jadwal shift untuk karyawan dalam format CSV.

Data Input:
- Karyawan: {{{employees}}} (Perhatikan status: 'active', 'on_leave', 'day_off')
- Kebutuhan Staf Harian: {{{employeesPerShift}}}
- Panduan Siklus Shift: {{{shiftCycle}}}
- Periode: {{startDate}} hingga {{endDate}} (Total {{numberOfDays}} hari)
- Aturan Tambahan: {{#if customRule}}{{{customRule}}}{{else}}Tidak ada.{{/if}}

ATURAN UTAMA (HARUS DIPATUHI):
1.  **Penuhi Kebutuhan Staf**: Untuk SETIAP HARI, jumlah karyawan di setiap shift ('Pagi', 'Siang', 'Malam') HARUS SAMA PERSIS dengan angka di 'Kebutuhan Staf Harian'. Ini adalah prioritas tertinggi.
2.  **Hanya Karyawan Aktif**: Hanya karyawan dengan status 'active' yang boleh dijadwalkan. Abaikan karyawan dengan status 'on_leave' atau 'day_off'.
3.  **Keseimbangan Kerja**: Sebisa mungkin, distribusikan jumlah total shift dan hari 'Libur' secara merata di antara semua karyawan aktif.

FORMAT OUTPUT (SANGAT PENTING):
- Kembalikan HANYA string CSV mentah. JANGAN sertakan teks, penjelasan, atau pemformatan markdown lain seperti \`\`\`csv.
- Baris Header: \`Karyawan,Hari 1,Hari 2,...,Hari {{numberOfDays}}\`
- Nilai Sel: Gunakan HANYA nilai ini untuk jadwal: \`Pagi\`, \`Siang\`, \`Malam\`, \`Libur\`.
`,
});

const suggestShiftScheduleFlow = ai.defineFlow(
  {
    name: 'suggestShiftScheduleFlow',
    inputSchema: SuggestShiftScheduleInputSchema,
    outputSchema: SuggestShiftScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
