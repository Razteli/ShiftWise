'use server';

import { suggestShiftSchedule } from '@/ai/flows/suggest-shift-schedule';
import { analyzeShiftSchedule } from '@/ai/flows/analyze-shift-schedule';
import type { ScheduleConfig } from '@/lib/schemas';

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
    const employeesJson = JSON.stringify(config.employees);

    const suggestionInput = {
      employees: employeesJson,
      shiftPatterns: config.shiftPatterns,
      hoursPerDay: config.hoursPerDay,
    };

    const suggestionResult = await suggestShiftSchedule(suggestionInput);
    if (!suggestionResult.schedule) {
      throw new Error('AI could not generate a schedule.');
    }

    const analysisInput = {
      schedule: JSON.stringify(suggestionResult.schedule),
      employees: employeesJson,
      shiftPatterns: config.shiftPatterns,
      hoursPerDay: config.hoursPerDay,
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
      e instanceof Error ? e.message : 'An unknown error occurred.';
    return { data: null, error: `Failed to generate schedule: ${errorMessage}` };
  }
}
