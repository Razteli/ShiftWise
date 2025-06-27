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
    const numEmployees =
      config.juniorEmployees +
      config.intermediateEmployees +
      config.seniorEmployees;

    // For now, employeeStatuses is a placeholder. A more complex UI would be needed to manage individual statuses.
    const employeeStatuses = `${numEmployees} employees are active.`;

    const suggestionInput = {
      numEmployees,
      juniorEmployees: config.juniorEmployees,
      intermediateEmployees: config.intermediateEmployees,
      seniorEmployees: config.seniorEmployees,
      shiftPatterns: config.shiftPatterns,
      hoursPerDay: config.hoursPerDay,
      employeeStatuses,
    };

    const suggestionResult = await suggestShiftSchedule(suggestionInput);
    if (!suggestionResult.schedule) {
      throw new Error('AI could not generate a schedule.');
    }

    const analysisInput = {
      schedule: JSON.stringify(suggestionResult.schedule),
      employeeCount: numEmployees,
      shiftPatterns: config.shiftPatterns,
      hoursPerDay: config.hoursPerDay,
      employeeStatus: JSON.stringify({
        active: numEmployees,
        on_leave: 0,
        day_off: 0,
      }),
      juniorCount: config.juniorEmployees,
      intermediateCount: config.intermediateEmployees,
      seniorCount: config.seniorEmployees,
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
