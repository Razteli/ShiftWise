'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing an uploaded shift schedule image.
 *
 * - analyzeUploadedSchedule - A function that analyzes the uploaded shift schedule and returns potential issues.
 * - AnalyzeUploadedScheduleInput - The input type for the analyzeUploadedSchedule function.
 * - AnalyzeShiftScheduleOutput - The return type from the original analysis flow, reused here.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AnalyzeShiftScheduleOutput } from './analyze-shift-schedule';
import { AnalyzeShiftScheduleOutputSchema } from '@/ai/schemas';

const AnalyzeUploadedScheduleInputSchema = z.object({
  employees: z
    .string()
    .describe(
      'A JSON string representing the list of employees, including their name, status, and level.'
    ),
  shiftCycle: z
    .string()
    .describe(
      'A JSON string representing the shift cycle configuration used in the schedule.'
    ),
  employeesPerShift: z
    .string()
    .describe(
      'A JSON string representing the number of employees required for each shift (morning, afternoon, night).'
    ),
  customRule: z
    .string()
    .optional()
    .describe('Additional custom rules provided by the user.'),
  scheduleDocument: z
    .string()
    .describe(
      "An image of an existing schedule, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type AnalyzeUploadedScheduleInput = z.infer<
  typeof AnalyzeUploadedScheduleInputSchema
>;

export async function analyzeUploadedSchedule(
  input: AnalyzeUploadedScheduleInput
): Promise<AnalyzeShiftScheduleOutput> {
  return analyzeUploadedScheduleFlow(input);
}

const analyzeUploadedSchedulePrompt = ai.definePrompt({
  name: 'analyzeUploadedSchedulePrompt',
  input: { schema: AnalyzeUploadedScheduleInputSchema },
  output: { schema: AnalyzeShiftScheduleOutputSchema },
  prompt: `Anda adalah seorang analis jadwal shift yang sangat ahli. Tugas Anda adalah menganalisis jadwal shift yang ada di dalam GAMBAR yang diunggah pengguna.

TUGAS UTAMA:
1.  **EKSTRAKSI DATA**: Pertama, secara internal, ekstrak informasi jadwal dari gambar. Identifikasi nama karyawan dan shift mereka setiap hari.
2.  **ANALISIS MENDALAM**: Analisis jadwal yang telah Anda ekstrak berdasarkan informasi konfigurasi yang diberikan (kebutuhan staf, daftar karyawan, dll.).

INFORMASI KONFIGURASI:
-   **Gambar Jadwal**: {{media url=scheduleDocument}} (INI ADALAH SUMBER UTAMA JADWAL YANG HARUS DIANALISIS)
-   **Daftar Karyawan (JSON)**: {{{employees}}}
-   **Konfigurasi Siklus Shift (JSON)**: {{{shiftCycle}}}
-   **Kebutuhan Karyawan per Shift (JSON)**: {{{employeesPerShift}}}
{{#if customRule}}
-   **Aturan Khusus Pengguna**: {{{customRule}}}
{{/if}}

POIN ANALISIS:
-   **Kecukupan Staf**: Apakah ada kekurangan atau kelebihan staf pada shift tertentu dibandingkan dengan kebutuhan?
-   **Kepatuhan Aturan**: Apakah aturan khusus pengguna (jika ada) dipatuhi?
-   **Keseimbangan Beban Kerja**: Apakah total shift dan hari libur terdistribusi secara adil di antara karyawan?
-   **Kepatuhan Pola**: Apakah jadwal mengikuti pola siklus shift yang diinginkan?

Setelah analisis selesai, berikan hasilnya dalam Bahasa Indonesia dalam format JSON yang telah ditentukan (issues dan suggestions).`,
});

const analyzeUploadedScheduleFlow = ai.defineFlow(
  {
    name: 'analyzeUploadedScheduleFlow',
    inputSchema: AnalyzeUploadedScheduleInputSchema,
    outputSchema: AnalyzeShiftScheduleOutputSchema,
  },
  async (input) => {
    const { output } = await analyzeUploadedSchedulePrompt(input);
    return output!;
  }
);
