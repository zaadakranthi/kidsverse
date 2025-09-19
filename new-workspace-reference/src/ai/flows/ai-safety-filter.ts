
'use server';
/**
 * @fileOverview An AI safety filter flow that detects abusive content.
 *
 * - aiSafetyFilter - A function that handles the content filtering process.
 * - AISafetyFilterInput - The input type for the aiSafetyFilter function.
 * - AISafetyFilterOutput - The return type for the aiSafetyFilter function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AISafetyFilterInputSchema = z.object({
  text: z.string().describe('The text content to be checked for safety violations.'),
  mediaUrl: z.string().optional().describe("The URL of the media content to be checked. Should be a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});
export type AISafetyFilterInput = z.infer<typeof AISafetyFilterInputSchema>;

const AISafetyFilterOutputSchema = z.object({
  isSafe: z.boolean().describe('Whether the content is safe or not.'),
  reason: z.string().describe('The reason why the content is considered unsafe, if applicable.'),
  category: z.string().optional().describe('The category of the detected harm, if applicable.'),
});
export type AISafetyFilterOutput = z.infer<typeof AISafetyFilterOutputSchema>;

export async function aiSafetyFilter(input: AISafetyFilterInput): Promise<AISafetyFilterOutput> {
  return aiSafetyFilterFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiSafetyFilterPrompt',
  input: {schema: AISafetyFilterInputSchema},
  output: {schema: AISafetyFilterOutputSchema},
  prompt: `You are an AI safety filter that detects abusive comments, adult content, and vulgar videos.

You will receive text and optionally a media URL as input. You must determine if the content is safe for students.

If the content is unsafe, explain the reason and categorize the harm. The harm categories are:
- HARM_CATEGORY_HATE_SPEECH
- HARM_CATEGORY_SEXUALLY_EXPLICIT
- HARM_CATEGORY_HARASSMENT
- HARM_CATEGORY_DANGEROUS_CONTENT
- HARM_CATEGORY_CIVIC_INTEGRITY

If the content is safe, return isSafe as true.

Text: {{{text}}}
{{#if mediaUrl}}
Media: {{media url=mediaUrl}}
{{/if}}`,
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_MEDIUM_AND_ABOVE',
      },
    ],
  },
});

const aiSafetyFilterFlow = ai.defineFlow(
  {
    name: 'aiSafetyFilterFlow',
    inputSchema: AISafetyFilterInputSchema,
    outputSchema: AISafetyFilterOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
