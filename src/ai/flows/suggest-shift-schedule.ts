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
  prompt: `Anda adalah asisten AI yang menyarankan jadwal shift optimal untuk karyawan.
  
  Buat jadwal untuk periode dari {{startDate}} hingga {{endDate}}, yang merupakan total {{numberOfDays}} hari.

  Pertimbangkan input berikut untuk menghasilkan jadwal yang seimbang dan bebas konflik:

  Karyawan (JSON): {{{employees}}}
  Siklus Shift: {{{shiftCycleDescription}}}
  Karyawan yang Dibutuhkan per Shift (JSON): {{{employeesPerShift}}}
  {{#if customRule}}
  Aturan Kustom: {{{customRule}}}
  {{/if}}

  Hasilkan jadwal shift yang mempertimbangkan ketersediaan karyawan, keseimbangan beban kerja, dan persyaratan shift.
  Jadwal output harus dalam format yang kompatibel dengan CSV, dengan "Karyawan" sebagai header kolom pertama, diikuti oleh kolom tanggal: "Hari 1", "Hari 2", ..., hingga "Hari {{numberOfDays}}".
  Jadwal harus mengikuti siklus shift yang disediakan untuk setiap karyawan yang tersedia. Misalnya, jika siklus melibatkan 2 shift Pagi, seorang karyawan harus bekerja 2 shift Pagi, kemudian melanjutkan ke bagian siklus berikutnya.
  Pastikan jumlah karyawan yang ditugaskan untuk setiap jenis shift pada setiap hari memenuhi persyaratan yang ditentukan dalam 'Karyawan yang Dibutuhkan per Shift'. Misalnya, jika persyaratan untuk 'Pagi' adalah 2, maka tepat dua karyawan harus ditugaskan 'Pagi' untuk hari itu.
  Pertimbangkan senioritas (level) saat menugaskan shift, menyeimbangkan beban kerja di semua kelas karyawan.
  Karyawan dengan status 'on_leave' atau 'day_off' tidak boleh ditugaskan shift apa pun selama seluruh periode.
  {{#if customRule}}
  Patuhi semua aturan kustom yang diberikan dengan ketat.
  {{/if}}
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
