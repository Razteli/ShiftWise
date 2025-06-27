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
  schedule: z.string().describe('The shift schedule in JSON format.'),
  employeeCount: z.number().describe('The total number of employees.'),
  shiftPatterns: z.string().describe('The shift patterns used in the schedule.'),
  hoursPerDay: z.number().describe('The number of hours per day.'),
  employeeStatus: z.string().describe('The status of employees (active, leave, day off) in JSON format.'),
  juniorCount: z.number().describe('The number of junior employees'),
  intermediateCount: z.number().describe('The number of intermediate employees'),
  seniorCount: z.number().describe('The number of senior employees'),
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
  prompt: `You are a shift schedule analyst. Analyze the provided shift schedule and identify potential issues such as employee overload, understaffing during peak hours, and unfair distribution of workload based on employee class (junior, intermediate, senior). Provide suggestions to resolve these issues.

Shift Schedule: {{{schedule}}}
Employee Count: {{{employeeCount}}}
Shift Patterns: {{{shiftPatterns}}}
Hours Per Day: {{{hoursPerDay}}}
Employee Status: {{{employeeStatus}}}
Junior Employee Count: {{{juniorCount}}}
Intermediate Employee Count: {{{intermediateCount}}}
Senior Employee Count: {{{seniorCount}}}`,
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
