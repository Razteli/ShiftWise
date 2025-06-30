'use server';

import { suggestShiftSchedule } from '@/ai/flows/suggest-shift-schedule';
import {
  analyzeShiftSchedule,
  type AnalyzeShiftScheduleOutput,
} from '@/ai/flows/analyze-shift-schedule';
import {
  analyzeUploadedSchedule as analyzeUploadedScheduleFlow,
  type AnalyzeUploadedScheduleInput,
} from '@/ai/flows/analyze-uploaded-schedule';
import type { ScheduleConfig } from '@/lib/schemas';
import { differenceInDays } from 'date-fns';

export interface ScheduleResult {
  schedule: string;
  analysis: {
    issues: string[];
    suggestions: string[];
  };
}

export async function generateAndAnalyzeSchedule(
  config: ScheduleConfig
): Promise<{ data: ScheduleResult | null; error: string | null }> {
  try {
    const activeEmployees = config.employees.filter(
      (e) => e.status === 'active'
    ).length;

    const maxEmployeesPerShift = Math.max(
      config.employeesPerShift.morning,
      config.employeesPerShift.afternoon,
      config.employeesPerShift.night
    );

    if (activeEmployees < maxEmployeesPerShift) {
      return {
        data: null,
        error: `Konfigurasi tidak memungkinkan. Jumlah karyawan aktif (${activeEmployees}) lebih sedikit dari yang dibutuhkan untuk satu shift (${maxEmployeesPerShift}). Harap tambahkan karyawan aktif atau kurangi kebutuhan per shift.`,
      };
    }

    const employeesJson = JSON.stringify(config.employees);
    const employeesPerShiftJson = JSON.stringify(config.employeesPerShift);

    const numberOfDays = differenceInDays(config.endDate, config.startDate) + 1;
    if (numberOfDays <= 0) {
      return { data: null, error: 'Tanggal selesai harus setelah tanggal mulai.' };
    }

    const suggestionInput = {
      employees: employeesJson,
      employeesPerShift: employeesPerShiftJson,
      startDate: config.startDate.toISOString(),
      endDate: config.endDate.toISOString(),
      numberOfDays: numberOfDays,
      monthlyOffDays: config.monthlyOffDays,
      customRule: config.customRule,
    };

    const suggestionResult = await suggestShiftSchedule(suggestionInput);
    if (!suggestionResult.schedule) {
      return {
        data: null,
        error:
          'AI tidak dapat menghasilkan jadwal dengan konfigurasi saat ini. Coba sesuaikan aturan, jumlah karyawan, atau rentang tanggal.',
      };
    }

    const analysisInput = {
      schedule: suggestionResult.schedule,
      employees: employeesJson,
      employeesPerShift: employeesPerShiftJson,
      monthlyOffDays: config.monthlyOffDays,
      customRule: config.customRule,
    };

    const analysisResult = await analyzeShiftSchedule(analysisInput);

    return {
      data: {
        schedule: suggestionResult.schedule,
        analysis: analysisResult,
      },
      error: null,
    };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'Terjadi kesalahan tidak dikenal.';
    return { data: null, error: `Gagal membuat jadwal: ${errorMessage}` };
  }
}

export async function reanalyzeSchedule(
  schedule: string,
  config: ScheduleConfig
): Promise<{ data: AnalyzeShiftScheduleOutput | null; error: string | null }> {
  try {
    const employeesJson = JSON.stringify(config.employees);
    const employeesPerShiftJson = JSON.stringify(config.employeesPerShift);

    const analysisInput = {
      schedule: schedule,
      employees: employeesJson,
      employeesPerShift: employeesPerShiftJson,
      monthlyOffDays: config.monthlyOffDays,
      customRule: config.customRule,
    };

    const analysisResult = await analyzeShiftSchedule(analysisInput);

    return {
      data: analysisResult,
      error: null,
    };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'Terjadi kesalahan tidak dikenal.';
    return {
      data: null,
      error: `Gagal menganalisis ulang jadwal: ${errorMessage}`,
    };
  }
}

export async function analyzeUploadedSchedule(
  formData: AnalyzeUploadedScheduleInput
): Promise<{ data: AnalyzeShiftScheduleOutput | null; error: string | null }> {
  try {
    if (!formData.scheduleDocument && !formData.scheduleText) {
      return {
        data: null,
        error: 'Silakan unggah file jadwal terlebih dahulu.',
      };
    }

    const analysisResult = await analyzeUploadedScheduleFlow(formData);

    return {
      data: analysisResult,
      error: null,
    };
  } catch (e) {
    console.error(e);
    const errorMessage =
      e instanceof Error ? e.message : 'Terjadi kesalahan tidak dikenal.';
    return {
      data: null,
      error: `Gagal menganalisis jadwal yang diunggah: ${errorMessage}`,
    };
  }
}
