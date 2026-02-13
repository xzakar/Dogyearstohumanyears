import { create } from 'zustand';
import { convertDogAgeToHumanYears, type DogSize } from '@/lib/age-converter';
import { generateDogFact, type DogFactOutput } from '@/ai/flows/generate-dog-fact';

type AppState = 'form' | 'loading' | 'results';

interface AppStoreState {
  // State
  appState: AppState;
  dogAge: number | undefined;
  dogSize: DogSize | undefined;
  humanAge: number | null;
  dogFact: DogFactOutput | null;
  error: string | null;

  // Actions
  setDogAge: (age: number) => void;
  setDogSize: (size: DogSize) => void;
  submitCalculation: () => Promise<void>;
  reset: () => void;
}

const initialState = {
  appState: 'form' as AppState,
  dogAge: undefined,
  dogSize: undefined,
  humanAge: null,
  dogFact: null,
  error: null,
};

export const useAppStore = create<AppStoreState>((set, get) => ({
  ...initialState,

  setDogAge: (age: number) => set({ dogAge: age }),

  setDogSize: (size: DogSize) => set({ dogSize: size }),

  submitCalculation: async () => {
    const { dogAge, dogSize } = get();
    
    if (dogAge === undefined || dogSize === undefined) {
      set({ error: 'Dog age and size are required' });
      return;
    }

    // Set loading state and clear previous results/errors
    set({ 
      appState: 'loading',
      humanAge: null,
      dogFact: null,
      error: null,
    });

    try {
      // Calculate the human age
      const calculatedAge = convertDogAgeToHumanYears(dogAge, dogSize);

      // Generate the AI dog fact
      const factResult = await generateDogFact();

      // Set results and transition to results state
      set({
        humanAge: calculatedAge,
        dogFact: factResult,
        appState: 'results',
      });
    } catch (error) {
      console.error('Failed to generate dog fact:', error);
      
      // Calculate age even if fact generation fails
      const calculatedAge = convertDogAgeToHumanYears(dogAge, dogSize);
      
      // Set error message but still show calculated age if available
      set({
        humanAge: calculatedAge,
        dogFact: null,
        error: error instanceof Error ? error.message : 'Failed to generate dog fact',
        appState: 'results',
      });
    }
  },

  reset: () => set(initialState),
}));

// Convenience selector hooks
export const useAppState = () => useAppStore((state) => state.appState);
export const useResults = () => useAppStore((state) => ({
  humanAge: state.humanAge,
  dogFact: state.dogFact,
}));
export const useDogAge = () => useAppStore((state) => state.dogAge);
export const useDogSize = () => useAppStore((state) => state.dogSize);
export const useError = () => useAppStore((state) => state.error);
