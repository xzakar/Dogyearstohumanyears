export type DogSize = 'small' | 'medium' | 'large';

/**
 * Converts a dog's age to human years based on its size.
 * The formula is a common approximation:
 * - Large dogs: 1st year is 12 human years, 2nd is 23 total, then +7 per year.
 * - Small/Medium dogs: 1st year is 15 human years, 2nd is 24 total.
 * - Small dogs: +4 per year after age 2.
 * - Medium dogs: +5 per year after age 2.
 *
 * @param age The dog's age in years.
 * @param size The dog's size ('small', 'medium', or 'large').
 * @returns The equivalent age in human years.
 */
export function convertDogAgeToHumanYears(age: number, size: DogSize): number {
  if (age <= 0) return 0;

  if (size === 'large') {
    if (age === 1) return 12;
    if (age === 2) return 23;
    return 23 + (age - 2) * 7;
  }
  
  if (age === 1) return 15;
  if (age === 2) return 24;

  if (size === 'small') {
    return 24 + (age - 2) * 4;
  }

  // Medium is the fallback
  return 24 + (age - 2) * 5;
}
