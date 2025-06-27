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
  employeesPerShift: z.string().describe('A JSON string representing the number of employees required for each shift (morning, afternoon, night).'),
  customRule: z.string().optional().describe('Additional custom rules provided by the user.'),
  scheduleDocument: z
    .string()
    .optional()
    .describe(
      "An image of an existing schedule, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
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
  prompt: `You are a shift schedule analyst. Analyze the provided generated shift schedule and identify potential issues such as employee overload, understaffing or overstaffing during shifts, and unfair distribution of workload based on employee level (junior, intermediate, senior). Provide suggestions to resolve these issues.

Generated Shift Schedule: {{{schedule}}}
Employees (JSON): {{{employees}}}
The schedule was generated based on this shift cycle: {{{shiftCycleDescription}}}.
Required Employees per Shift (JSON): {{{employeesPerShift}}}

Your analysis should check for understaffing or overstaffing on any given day for any shift, based on the required number of employees.

{{#if customRule}}
The user also provided these custom rules which should have been followed: {{{customRule}}}
Your analysis should check if the generated schedule respects these rules.
{{/if}}

{{#if scheduleDocument}}
The user has also uploaded an image of a real, existing schedule for context and comparison. Use it to inform your analysis. For example, you can compare the generated schedule to the uploaded one to see if there are significant deviations in patterns, or use it to better understand unstated company policies.
Uploaded Schedule Image: {{media url=scheduleDocument}}
{{/if}}

Based on all this information, provide your analysis.`,
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
