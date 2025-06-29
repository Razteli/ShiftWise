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
  employees: z.string().describe('A JSON string representing the list of employees, including their name, status (active, on_leave, day_off), and level (junior, intermediate, senior).'),
  shiftCycleDescription: z.string().describe('A description of the shift cycle, e.g., "2 morning days, 2 afternoon days, 2 night days, 2 off days".'),
  employeesPerShift: z.string().describe('A JSON string representing the number of employees required for each shift (morning, afternoon, night).'),
  startDate: z.string().describe('The start date for the schedule period in ISO format.'),
  endDate: z.string().describe('The end date for the schedule period in ISO format.'),
  numberOfDays: z.number().describe('The total number of days in the schedule period.'),
  customRule: z.string().optional().describe('Additional custom rules provided by the user.'),
});
export type SuggestShiftScheduleInput = z.infer<typeof SuggestShiftScheduleInputSchema>;

const SuggestShiftScheduleOutputSchema = z.object({
  schedule: z.string().describe('The suggested shift schedule in a CSV-compatible format.'),
});
export type SuggestShiftScheduleOutput = z.infer<typeof SuggestShiftScheduleOutputSchema>;

export async function suggestShiftSchedule(input: SuggestShiftScheduleInput): Promise<SuggestShiftScheduleOutput> {
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
- Pola Siklus Shift yang Diinginkan: {{{shiftCycleDescription}}}
{{#if customRule}}
- Aturan Tambahan: {{{customRule}}}
{{/if}}

Tujuan utama Anda adalah memenuhi **Persyaratan Karyawan per Shift** untuk setiap hari (Pagi, Siang, Malam).
Gunakan **Pola Siklus Shift** sebagai panduan utama untuk rotasi karyawan, tetapi prioritas utama adalah memenuhi jumlah staf harian.
Seimbangkan beban kerja antar karyawan, dengan mempertimbangkan level senioritas mereka.
Karyawan dengan status 'on_leave' atau 'day_off' TIDAK BOLEH dijadwalkan sama sekali.

Format output HARUS berupa string CSV yang valid.
- Baris pertama adalah header: "Karyawan", "Hari 1", "Hari 2", ..., "Hari {{numberOfDays}}".
- Setiap baris berikutnya mewakili satu karyawan.
- Gunakan nilai shift yang tepat seperti yang dijelaskan dalam siklus: 'Pagi', 'Siang', 'Malam', 'Libur'.
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
