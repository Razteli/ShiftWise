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
  prompt: `**TUGAS**: Buat jadwal shift dalam format CSV.

**ATURAN UTAMA (WAJIB DIPATUHI):**
1.  **PENUHI KEBUTUHAN STAF**: Untuk setiap hari, jumlah karyawan yang bekerja di setiap shift ('Pagi', 'Siang', 'Malam') HARUS SAMA PERSIS dengan nilai di \`{{{employeesPerShift}}}\`. Ini adalah prioritas tertinggi.
2.  **KARYAWAN TIDAK AKTIF**: Karyawan dengan status BUKAN 'active' (misalnya 'on_leave', 'day_off') TIDAK BOLEH dijadwalkan. Abaikan mereka sepenuhnya.
3.  **HANYA KARYAWAN AKTIF**: Hanya karyawan dengan status 'active' dari \`{{{employees}}}\` yang boleh ada di jadwal.
4.  **KESEIMBANGAN KERJA**: Sebisa mungkin, distribusikan jumlah total shift dan hari 'Libur' secara merata di antara semua karyawan aktif.

**PANDUAN (FLEKSIBEL):**
*   **SIKLUS SHIFT**: Gunakan \`{{{shiftCycle}}}\` sebagai panduan untuk rotasi shift (misalnya, beberapa hari Pagi berturut-turut). Aturan ini BOLEH dilanggar jika diperlukan untuk memenuhi **ATURAN UTAMA**.

**DATA INPUT:**
*   Periode Jadwal: \`{{startDate}}\` hingga \`{{endDate}}\` (Total \`{{numberOfDays}}\` hari).
*   Daftar Karyawan (JSON): \`{{{employees}}}\`
*   Kebutuhan Staf per Shift (JSON): \`{{{employeesPerShift}}}\`
*   Panduan Siklus Shift (JSON): \`{{{shiftCycle}}}\`
*   Aturan Khusus: \`{{#if customRule}}{{{customRule}}}{{else}}Tidak ada.{{/if}}\`

**FORMAT OUTPUT (SANGAT PENTING):**
*   **HANYA CSV**: Kembalikan HANYA string CSV mentah. JANGAN sertakan teks, penjelasan, atau pemformatan markdown lain seperti \`\`\`csv.
*   **HEADER**: Baris pertama HARUS: \`Karyawan,Hari 1,Hari 2,...,Hari {{numberOfDays}}\`
*   **BARIS**: Setiap baris berikutnya adalah untuk satu karyawan aktif.
*   **NILAI SEL**: Gunakan HANYA nilai ini untuk jadwal: \`Pagi\`, \`Siang\`, \`Malam\`, \`Libur\`.
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
