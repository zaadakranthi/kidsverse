
'use server';
/**
 * @fileOverview An AI flow to award points to users for specific actions.
 *
 * - awardPoints - A function that handles the point awarding process.
 * - AwardPointsInput - The input type for the awardPoints function.
 * - AwardPointsOutput - The return type for the awardPoints function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { pointsConfig } from '@/lib/data';

const PointActionSchema = z.enum([
    'CREATE_STUDY_ROOM',
    'STUDENT_JOINS_ROOM',
    'ASK_QUESTION',
    'ANSWER_QUESTION',
    'CREATE_VIDEO_POST',
    'CREATE_BRAIN_GAME',
    'PLAY_BRAIN_GAME',
    'CREATE_QUIZ',
]);

const AwardPointsInputSchema = z.object({
  userId: z.string().describe('The ID of the user to award points to.'),
  action: PointActionSchema.describe('The action for which points are being awarded.'),
});
export type AwardPointsInput = z.infer<typeof AwardPointsInputSchema>;

const AwardPointsOutputSchema = z.object({
    pointsAwarded: z.number().describe('The number of points awarded for the action.'),
    newTotal: z.number().describe('The new total number of points for the user.'),
    message: z.string().describe('A confirmation message.'),
});
export type AwardPointsOutput = z.infer<typeof AwardPointsOutputSchema>;

export async function awardPoints(input: AwardPointsInput): Promise<AwardPointsOutput> {
  return awardPointsFlow(input);
}

const awardPointsFlow = ai.defineFlow(
  {
    name: 'awardPointsFlow',
    inputSchema: AwardPointsInputSchema,
    outputSchema: AwardPointsOutputSchema,
  },
  async (input) => {
    let pointsToAward = 0;
    
    // In a real application, you would fetch the user's current points from a database.
    // For this demo, we'll simulate it.
    let currentPoints = 1200; // Assuming currentUser's initial points

    switch (input.action) {
        case 'CREATE_STUDY_ROOM':
            pointsToAward = pointsConfig.createStudyRoom;
            break;
        case 'STUDENT_JOINS_ROOM':
            pointsToAward = pointsConfig.studentJoinsRoom;
            break;
        case 'ASK_QUESTION':
            pointsToAward = pointsConfig.askQuestion;
            break;
        case 'ANSWER_QUESTION':
            pointsToAward = pointsConfig.answerQuestion;
            break;
        case 'CREATE_VIDEO_POST':
            pointsToAward = pointsConfig.createVideoPost;
            break;
        case 'CREATE_BRAIN_GAME':
             pointsToAward = pointsConfig.createBrainGame;
            break;
        case 'CREATE_QUIZ':
             pointsToAward = pointsConfig.createQuiz;
            break;
        case 'PLAY_BRAIN_GAME':
            pointsToAward = pointsConfig.playBrainGame;
            break;
    }

    const newTotal = currentPoints + pointsToAward;

    // In a real application, you would save the newTotal to the database for the user.

    return {
        pointsAwarded: pointsToAward,
        newTotal: newTotal,
        message: `Successfully awarded ${pointsToAward} points for ${input.action}. User ${input.userId} now has ${newTotal} points.`
    };
  }
);
