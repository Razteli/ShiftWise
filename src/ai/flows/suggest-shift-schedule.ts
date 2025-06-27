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
  prompt: `You are an AI assistant that suggests optimal shift schedules for employees. Create a schedule for a 30-day period.

  Consider the following inputs to generate a balanced and conflict-free schedule:

  Employees (JSON): {{{employees}}}
  Shift Cycle: {{{shiftCycleDescription}}}
  Hours per Shift: {{{hoursPerDay}}}

  Generate a shift schedule that takes into account employee availability, workload balance, and shift requirements.
  The output schedule should be in a CSV-compatible format, with employee names as rows and dates (Day 1, Day 2, etc.) as columns for 30 days.
  The schedule should follow the provided shift cycle for each available employee. For example, if the cycle involves 2 Pagi shifts, an employee should work 2 Pagi shifts, then continue to the next part of the cycle.
  Ensure all shifts are covered and employee preferences (status) are considered.
  Consider seniority (level) when assigning shifts, balancing workload across all employee classes.
  Employees with status 'on_leave' or 'day_off' should not be assigned any shifts for the entire period.
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
