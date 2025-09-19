
'use server';
/**
 * @fileOverview AI flow to recommend relevant videos and Q&A posts to students.
 *
 * - recommendContent - A function that recommends content to students.
 * - RecommendContentInput - The input type for the recommendContent function.
 * - RecommendContentOutput - The return type for the recommendContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecommendContentInputSchema = z.object({
  studentClass: z.string().describe('The class of the student.'),
  studentSchool: z.string().describe('The school of the student.'),
  studentInterests: z.array(z.string()).describe('The interests of the student.'),
  recentActivity: z.array(z.string()).optional().describe('A list of recent subjects the student has interacted with (e.g., watched videos, answered questions).'),
  contentTypes: z.array(z.enum(['video', 'qa'])).describe('The types of content to recommend (video or qa).'),
  numberOfRecommendations: z.number().describe('The number of recommendations to return.'),
});
export type RecommendContentInput = z.infer<typeof RecommendContentInputSchema>;

const RecommendedContentSchema = z.object({
  title: z.string().describe('The title of the content.'),
  url: z.string().describe('The URL of the content.'),
  contentType: z.enum(['video', 'qa']).describe('The type of content (video or qa).'),
  source: z.string().describe('The source of the content (e.g., student name).'),
  reason: z.string().describe('The reason for the recommendation.'),
});

const RecommendContentOutputSchema = z.array(RecommendedContentSchema);
export type RecommendContentOutput = z.infer<typeof RecommendContentOutputSchema>;

export async function recommendContent(input: RecommendContentInput): Promise<RecommendContentOutput> {
  return recommendContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recommendContentPrompt',
  input: {schema: RecommendContentInputSchema},
  output: {schema: RecommendContentOutputSchema},
  prompt: `You are an AI assistant designed to recommend educational videos and Q&A posts to students.

  The student is in class {{studentClass}} at {{studentSchool}} and has the following interests: {{studentInterests}}.

  Please recommend {{numberOfRecommendations}} pieces of content of the following types: {{contentTypes}}.

  Prioritize content from students in the same class, school, or with similar interests. 
  
  {{#if recentActivity}}
  The student has recently interacted with content on the following subjects: {{recentActivity}}. Pay special attention to these topics when making recommendations.
  {{/if}}

  Provide a reason for each recommendation.

  Format your response as a JSON array of objects, where each object has the following fields:
  - title: The title of the content.
  - url: The URL of the content.
  - contentType: The type of content (video or qa).
  - source: The source of the content (e.g., student name).
  - reason: The reason for the recommendation.
  `,
});

const recommendContentFlow = ai.defineFlow(
  {
    name: 'recommendContentFlow',
    inputSchema: RecommendContentInputSchema,
    outputSchema: RecommendContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
