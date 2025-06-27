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
  shiftPatterns: z.string().describe('The shift patterns, e.g., A, B, C.'),
  hoursPerDay: z.number().describe('The number of hours per shift.'),
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
  prompt: `You are an AI assistant that suggests optimal shift schedules for employees.

  Consider the following inputs to generate a balanced and conflict-free schedule:

  Employees (JSON): {{{employees}}}
  Shift Patterns: {{{shiftPatterns}}}
  Hours per Shift: {{{hoursPerDay}}}

  Generate a shift schedule that takes into account employee availability, workload balance, and shift requirements.
  The output schedule should be in a CSV-compatible format, with employee names as rows and dates/days as columns.
  Ensure all shifts are covered and employee preferences (status) are considered.
  Consider seniority (level) when assigning shifts, balancing workload across all employee classes.
  Employees with status 'on_leave' or 'day_off' should not be assigned shifts.
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
