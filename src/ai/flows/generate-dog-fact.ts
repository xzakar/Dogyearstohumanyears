'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating a fun fact about dogs.
 *
 * The flow uses the getDogFact function to fetch a fact, leveraging the DogFactOutput type
 * to ensure structured output.
 *
 * @remarks
 *   - generateDogFact - An async function that triggers the dog fact generation flow.
 *   - DogFactOutput - The schema for the output of the flow, ensuring a structured response.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DogFactOutputSchema = z.object({
  fact: z.string().describe('A fun fact about dogs.'),
});

export type DogFactOutput = z.infer<typeof DogFactOutputSchema>;

export async function generateDogFact(): Promise<DogFactOutput> {
  return generateDogFactFlow();
}

const prompt = ai.definePrompt({
  name: 'dogFactPrompt',
  output: {schema: DogFactOutputSchema},
  prompt: `Generate a single fun fact about dogs. Return the fact in the following JSON schema: ${DogFactOutputSchema.description}.`,
});

const generateDogFactFlow = ai.defineFlow(
  {
    name: 'generateDogFactFlow',
    outputSchema: DogFactOutputSchema,
  },
  async () => {
    const {output} = await prompt({});
    return output!;
  }
);
