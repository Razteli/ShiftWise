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
  prompt: `Anda adalah asisten AI yang ahli dalam membuat jadwal shift karyawan yang optimal.
Tugas Anda adalah membuat jadwal shift untuk periode dari {{startDate}} hingga {{endDate}} (total {{numberOfDays}} hari).

Gunakan informasi berikut untuk membuat jadwal:
- Karyawan (JSON): {{{employees}}}
- Persyaratan Karyawan per Shift (JSON): {{{employeesPerShift}}}
- Konfigurasi Siklus Shift (JSON): {{{shiftCycle}}}
{{#if customRule}}
- Aturan Tambahan: {{{customRule}}}
{{/if}}

**Kendala Penting:**
1.  **Prioritas Utama:** Penuhi **Persyaratan Karyawan per Shift** untuk setiap shift (Pagi, Siang, Malam) di setiap hari.
2.  **Panduan Siklus:** Gunakan **Konfigurasi Siklus Shift** sebagai panduan untuk rotasi. Misalnya, jika 'morning' adalah 2, usahakan karyawan bekerja 2 shift Pagi berturut-turut. Namun, aturan ini boleh dilanggar jika diperlukan untuk memenuhi persyaratan staf (prioritas #1).
3.  **Status Karyawan:** Karyawan dengan status 'on_leave' atau 'day_off' **TIDAK BOLEH** dijadwalkan sama sekali. Jadwalkan **HANYA** karyawan dengan status 'active'.
4.  **Keseimbangan:** Seimbangkan beban kerja dan jumlah hari libur antar karyawan aktif.

**Format Output (WAJIB DIPATUHI):**
- Output HARUS berupa string **CSV yang valid**, dan tidak ada teks lain sebelum atau sesudahnya.
- Baris pertama adalah header: "Karyawan", diikuti oleh "Hari 1", "Hari 2", ..., "Hari {{numberOfDays}}".
- Setiap baris berikutnya mewakili satu karyawan yang berstatus 'active'.
- Gunakan **hanya** nilai-nilai berikut untuk sel jadwal: 'Pagi', 'Siang', 'Malam', 'Libur'. Jangan gunakan nilai lain.
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
