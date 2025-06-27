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
  numEmployees: z.number().describe('The total number of employees.'),
  juniorEmployees: z.number().describe('The number of junior employees.'),
  intermediateEmployees: z.number().describe('The number of intermediate employees.'),
  seniorEmployees: z.number().describe('The number of senior employees.'),
  shiftPatterns: z.string().describe('The shift patterns, e.g., A, B, C.'),
  hoursPerDay: z.number().describe('The number of hours per shift.'),
  employeeStatuses: z.string().describe('The employee statuses (active, leave, day off) as a string.'),
});
export type SuggestShiftScheduleInput = z.infer<typeof SuggestShiftScheduleInputSchema>;

const SuggestShiftScheduleOutputSchema = z.object({
  schedule: z.string().describe('The suggested shift schedule.'),
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

  Number of Employees: {{{numEmployees}}}
  Number of Junior Employees: {{{juniorEmployees}}}
  Number of Intermediate Employees: {{{intermediateEmployees}}}
  Number of Senior Employees: {{{seniorEmployees}}}
  Shift Patterns: {{{shiftPatterns}}}
  Hours per Day: {{{hoursPerDay}}}
  Employee Statuses: {{{employeeStatuses}}}

  Generate a shift schedule that takes into account employee availability, workload balance, and shift requirements.
  Return the schedule in a readable format.
  Ensure all shifts are covered and employee preferences are considered where possible.
  Consider seniority when assigning shifts, balancing workload across all employee classes.
  Employees on leave or day off should not be assigned shifts.
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
