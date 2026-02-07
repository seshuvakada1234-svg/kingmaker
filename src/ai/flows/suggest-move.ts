'use server';
/**
 * @fileOverview Suggests a chess move to the user.
 *
 * - suggestMove - A function that suggests a chess move.
 * - SuggestMoveInput - The input type for the suggestMove function.
 * - SuggestMoveOutput - The return type for the suggestMove function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMoveInputSchema = z.object({
  boardState: z.string().describe('A string describing the current state of the chess board in FEN notation.'),
  difficulty: z.enum(['easy', 'hard']).describe('The difficulty level of the suggestion.'),
});
export type SuggestMoveInput = z.infer<typeof SuggestMoveInputSchema>;

const SuggestMoveOutputSchema = z.object({
  suggestedMove: z.string().describe('A string describing the suggested move in algebraic notation (e.g., e2e4).'),
  explanation: z.string().describe('An explanation of why the move is suggested.'),
});
export type SuggestMoveOutput = z.infer<typeof SuggestMoveOutputSchema>;

export async function suggestMove(input: SuggestMoveInput): Promise<SuggestMoveOutput> {
  return suggestMoveFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMovePrompt',
  input: {schema: SuggestMoveInputSchema},
  output: {schema: SuggestMoveOutputSchema},
  prompt: `You are an expert chess player. You will suggest the best move for the current player, given the current board state in FEN notation.

Current board state: {{{boardState}}}

Difficulty: {{{difficulty}}}

Consider the difficulty level when suggesting the move. If the difficulty is easy, suggest a move that is not too complex. If the difficulty is hard, suggest the best move, even if it is complex.

Output the suggested move in algebraic notation (e.g., e2e4), followed by an explanation of why the move is suggested.`,
});

const suggestMoveFlow = ai.defineFlow(
  {
    name: 'suggestMoveFlow',
    inputSchema: SuggestMoveInputSchema,
    outputSchema: SuggestMoveOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
