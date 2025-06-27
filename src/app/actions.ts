'use server';

import { suggestShiftSchedule } from '@/ai/flows/suggest-shift-schedule';
import { analyzeShiftSchedule } from '@/ai/flows/analyze-shift-schedule';
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
    const employeesJson = JSON.stringify(config.employees);
    const employeesPerShiftJson = JSON.stringify(config.employeesPerShift);

    const { morning, afternoon, night, off } = config.shiftCycle;
    const shiftCycleDescription =
      `A cycle of ${morning} morning shifts, ` +
      `${afternoon} afternoon shifts, ${night} night shifts, ` +
      `and ${off} days off. The shift names to use in the CSV output are 'Pagi' for morning, 'Siang' for afternoon, 'Malam' for night, and 'Libur' for off days.`;

    const numberOfDays = differenceInDays(config.endDate, config.startDate) + 1;
    if (numberOfDays <= 0) {
      return { data: null, error: 'End date must be after start date.' };
    }


    const suggestionInput = {
      employees: employeesJson,
      shiftCycleDescription: shiftCycleDescription,
      employeesPerShift: employeesPerShiftJson,
      startDate: config.startDate.toISOString(),
      endDate: config.endDate.toISOString(),
      numberOfDays: numberOfDays,
      customRule: config.customRule,
    };

    const suggestionResult = await suggestShiftSchedule(suggestionInput);
    if (!suggestionResult.schedule) {
      throw new Error('AI could not generate a schedule.');
    }

    const analysisInput = {
      schedule: JSON.stringify(suggestionResult.schedule),
      employees: employeesJson,
      shiftCycleDescription: shiftCycleDescription,
      employeesPerShift: employeesPerShiftJson,
      customRule: config.customRule,
      scheduleDocument: config.scheduleDocument,
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
