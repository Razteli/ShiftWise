'use server';

/**
 * @fileOverview This file defines a Genkit flow for analyzing a shift schedule and identifying potential issues.
 *
 * - analyzeShiftSchedule - A function that analyzes the shift schedule and returns potential issues.
 * - AnalyzeShiftScheduleInput - The input type for the analyzeShiftSchedule function.
 * - AnalyzeShiftScheduleOutput - The return type for the analyzeShiftSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeShiftScheduleInputSchema = z.object({
  schedule: z.string().describe('The shift schedule in a CSV-compatible format.'),
  employees: z.string().describe('A JSON string representing the list of employees, including their name, status, and level.'),
  shiftCycleDescription: z.string().describe('A description of the shift cycle used in the schedule.'),
  hoursPerDay: z.number().describe('The number of hours per day.'),
});
export type AnalyzeShiftScheduleInput = z.infer<typeof AnalyzeShiftScheduleInputSchema>;

const AnalyzeShiftScheduleOutputSchema = z.object({
  issues: z.array(z.string()).describe('An array of identified issues in the shift schedule.'),
  suggestions: z.array(z.string()).describe('An array of suggestions to resolve the identified issues.'),
});
export type AnalyzeShiftScheduleOutput = z.infer<typeof AnalyzeShiftScheduleOutputSchema>;

export async function analyzeShiftSchedule(input: AnalyzeShiftScheduleInput): Promise<AnalyzeShiftScheduleOutput> {
  return analyzeShiftScheduleFlow(input);
}

const analyzeShiftSchedulePrompt = ai.definePrompt({
  name: 'analyzeShiftSchedulePrompt',
  input: {schema: AnalyzeShiftScheduleInputSchema},
  output: {schema: AnalyzeShiftScheduleOutputSchema},
  prompt: `You are a shift schedule analyst. Analyze the provided shift schedule and identify potential issues such as employee overload, understaffing during peak hours, and unfair distribution of workload based on employee level (junior, intermediate, senior). Provide suggestions to resolve these issues.

Shift Schedule: {{{schedule}}}
Employees (JSON): {{{employees}}}
The schedule was generated based on this shift cycle: {{{shiftCycleDescription}}}.
Hours Per Shift: {{{hoursPerDay}}}`,
});

const analyzeShiftScheduleFlow = ai.defineFlow(
  {
    name: 'analyzeShiftScheduleFlow',
    inputSchema: AnalyzeShiftScheduleInputSchema,
    outputSchema: AnalyzeShiftScheduleOutputSchema,
  },
  async input => {
    const {output} = await analyzeShiftSchedulePrompt(input);
    return output!;
  }
);
