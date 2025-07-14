'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting shift schedules based on employee availability and requirements.
 *
 * - suggestShiftSchedule - A function that generates shift schedule suggestions.
 * - SuggestShiftScheduleInput - The input type for the suggestShiftSchedule function.
 * - SuggestShiftScheduleOutput - The return type for the suggestShiftschedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestShiftScheduleInputSchema = z.object({
  employees: z
    .string()
    .describe(
      'A JSON string representing the list of employees, including their name, and status (active, on_leave, day_off).'
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
  monthlyOffDays: z
    .number()
    .optional()
    .describe('The maximum number of off days per employee in a month.'),
  customRule: z
    .string()
    .optional()
    .describe('Additional custom rules provided by the user.'),
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
  prompt: `Anda adalah AI yang sangat ahli dalam membuat jadwal shift karyawan dalam format CSV.

TUGAS ANDA: Buat jadwal untuk {{numberOfDays}} hari.

ATURAN PALING PENTING (HARUS DIPATUHI):
1.  **KEBUTUHAN STAF HARIAN**: Gunakan JSON ini untuk mengetahui berapa banyak orang yang dibutuhkan setiap shift, setiap hari. ANDA HARUS MEMENUHI JUMLAH INI SECARA TEPAT.
    \`\`\`json
    {{{employeesPerShift}}}
    \`\`\`
2.  **DAFTAR KARYAWAN**: Gunakan JSON ini.
    - Hanya jadwalkan shift kerja ('Pagi', 'Siang', 'Malam') untuk karyawan dengan status 'active'.
    - Jika status karyawan adalah 'on_leave', Anda HARUS mengisi semua hari mereka dengan 'Cuti'.
    - Jika status karyawan adalah 'day_off', Anda HARUS mengisi semua hari mereka dengan 'Libur'.
    \`\`\`json
    {{{employees}}}
    \`\`\`
3.  **KESEIMBANGAN**: Sebisa mungkin, berikan jumlah total shift ('Pagi', 'Siang', 'Malam') dan hari 'Libur' yang merata untuk semua karyawan 'active'.

{{#if monthlyOffDays}}
4.  **HARI LIBUR MAKSIMAL**: Setiap karyawan 'active' harus mendapatkan maksimal {{monthlyOffDays}} hari 'Libur' selama periode jadwal ini. Jangan berikan lebih dari jumlah ini.
{{/if}}

{{#if customRule}}
ATURAN TAMBAHAN DARI PENGGUNA:
- {{{customRule}}}
{{/if}}

FORMAT OUTPUT (WAJIB):
- Kembalikan HANYA string CSV mentah. Tidak ada teks atau penjelasan lain.
- Header: \`Karyawan,Hari 1,Hari 2,...,Hari {{numberOfDays}}\`
- Nilai sel harus salah satu dari: \`Pagi\`, \`Siang\`, \`Malam\`, \`Libur\`, atau \`Cuti\`.
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
