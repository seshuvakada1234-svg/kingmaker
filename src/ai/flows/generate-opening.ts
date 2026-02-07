'use server';

/**
 * @fileOverview Generates a random valid chess opening sequence.
 *
 * - generateOpening - A function that generates a chess opening.
 * - GenerateOpeningInput - The input type for the generateOpening function.
 * - GenerateOpeningOutput - The return type for the generateOpening function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateOpeningInputSchema = z.object({
  numMoves: z.number().int().min(1).max(10).default(3).describe('The number of moves in the opening sequence (half-moves).'),
});
export type GenerateOpeningInput = z.infer<typeof GenerateOpeningInputSchema>;

const GenerateOpeningOutputSchema = z.object({
  openingMoves: z.string().describe('A sequence of valid chess moves in algebraic notation.'),
});
export type GenerateOpeningOutput = z.infer<typeof GenerateOpeningOutputSchema>;

export async function generateOpening(input: GenerateOpeningInput): Promise<GenerateOpeningOutput> {
  return generateOpeningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateOpeningPrompt',
  input: {schema: GenerateOpeningInputSchema},
  output: {schema: GenerateOpeningOutputSchema},
  prompt: `You are a chess expert. Generate a valid sequence of {{{numMoves}}} chess moves in algebraic notation, starting from the initial chess position.  The moves must be legal and form a valid opening sequence. Return the moves separated by spaces.

Example:
Input: 3
Output: e4 c5 Nf3 Nc6 d4`,
});

const generateOpeningFlow = ai.defineFlow(
  {
    name: 'generateOpeningFlow',
    inputSchema: GenerateOpeningInputSchema,
    outputSchema: GenerateOpeningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
