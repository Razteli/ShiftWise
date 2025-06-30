'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing an uploaded shift schedule document.
 *
 * - analyzeUploadedSchedule - A function that analyzes the uploaded shift schedule and returns potential issues.
 * - AnalyzeUploadedScheduleInput - The input type for the analyzeUploadedSchedule function.
 * - AnalyzeShiftScheduleOutput - The return type from the original analysis flow, reused here.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import type { AnalyzeShiftScheduleOutput } from './analyze-shift-schedule';
import { AnalyzeShiftScheduleOutputSchema } from '@/ai/schemas';

const AnalyzeUploadedScheduleInputSchema = z
  .object({
    scheduleDocument: z
      .string()
      .optional()
      .describe(
        "An image of an existing schedule, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
      ),
    scheduleText: z
      .string()
      .optional()
      .describe(
        'The text content of an existing schedule, extracted from a document like .docx or .xlsx (as CSV).'
      ),
  })
  .refine(data => data.scheduleDocument || data.scheduleText, {
    message: 'Either scheduleDocument or scheduleText must be provided.',
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
  prompt: `Anda adalah AI analis jadwal shift yang sangat ahli. Tugas Anda adalah menganalisis secara komprehensif jadwal shift yang ada dari sumber yang diberikan. Anda harus menyimpulkan semua informasi yang diperlukan langsung dari konten.

{{#if scheduleDocument}}
SUMBER JADWAL (GAMBAR): {{media url=scheduleDocument}}
{{else}}
SUMBER JADWAL (TEKS):
{{{scheduleText}}}
{{/if}}

TUGAS ANDA:
1.  **Ekstrak dan Simpulkan**:
    *   Ekstrak nama semua karyawan dan jadwal shift mereka (Pagi, Siang, Malam, Libur) untuk setiap hari.
    *   Simpulkan kebutuhan staf untuk setiap shift (Pagi, Siang, Malam) dengan menghitung jumlah orang yang dijadwalkan di setiap shift pada hari-hari biasa. Anggap ini sebagai kebutuhan staf yang diinginkan.
    *   Simpulkan aturan atau pola yang mungkin ada (misalnya, siklus shift, aturan hari libur).

2.  **Analisis Mendalam**: Berdasarkan informasi yang Anda ekstrak dan simpulkan, lakukan analisis lengkap.
    *   **Kecukupan Staf**: Identifikasi hari atau shift mana pun di mana jumlah staf aktual secara signifikan menyimpang dari kebutuhan staf yang Anda simpulkan. Apakah ada kekurangan atau kelebihan staf?
    *   **Keseimbangan Beban Kerja**: Apakah total shift (Pagi, Siang, Malam) dan hari libur didistribusikan secara adil di antara semua karyawan? Hitung total untuk setiap kategori per karyawan dan soroti ketidakseimbangan yang signifikan.
    *   **Pola yang Dilanggar**: Apakah ada karyawan yang polanya secara drastis berbeda dari yang lain atau melanggar pola umum yang Anda simpulkan? (misalnya, terlalu banyak shift malam berturut-turut).

3.  **Hasil Output**: Berikan hasil analisis Anda dalam Bahasa Indonesia, dalam format JSON yang telah ditentukan. Fokus pada masalah yang dapat ditindaklanjuti dan saran yang bermanfaat.
    *   **issues**: Daftar masalah yang jelas dan spesifik.
    *   **suggestions**: Saran konkret untuk memperbaiki setiap masalah.`,
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
