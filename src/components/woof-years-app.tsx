"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { convertDogAgeToHumanYears, type DogSize } from "@/lib/age-converter";
import { generateDogFact, type DogFactOutput } from "@/ai/flows/generate-dog-fact";
import { PawPrint, Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { CountUp } from "@/components/count-up";


const formSchema = z.object({
  age: z.coerce.number().positive({ message: "Age must be a positive number." }).max(30, { message: "That's a very old dog!" }),
  size: z.enum(["small", "medium", "large"], {
    required_error: "You need to select a dog size.",
  }),
});

type FormValues = z.infer<typeof formSchema>;

type AppState = "form" | "loading" | "results";

type Results = {
    humanAge: number;
    dogFact: DogFactOutput | null;
}

export function WoofYearsApp() {
  const [appState, setAppState] = useState<AppState>("form");
  const [results, setResults] = useState<Results | null>(null);

  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      age: undefined,
    },
  });

  async function onSubmit(values: FormValues) {
    setAppState("loading");
    setResults(null);
    
    try {
      const calculatedAge = convertDogAgeToHumanYears(values.age, values.size as DogSize);

      // Kick off the AI fact generation
      const factResult = await generateDogFact();

      setResults({humanAge: calculatedAge, dogFact: factResult});
      setAppState("results");
    } catch (error) {
      console.error("Failed to generate dog fact:", error);
      toast({
        variant: "destructive",
        title: "Oh no! Something went wrong.",
        description: "We couldn't fetch a fun fact right now. Please try again.",
      });
      // Still show the age result if it was calculated
      const calculatedAge = convertDogAgeToHumanYears(values.age, values.size as DogSize)
      if (calculatedAge) {
        setResults({ humanAge: calculatedAge, dogFact: null });
        setAppState("results");
      } else {
        setAppState("form");
      }
    }
  }

  function handleReset() {
    form.reset();
    setAppState("form");
    setResults(null);
  }

  return (
    <div className="mt-8 w-full">
      {appState === "form" && (
        <div className="animate-in fade-in-50 duration-500">
          <Card className="w-full shadow-lg rounded-2xl bg-card/70 backdrop-blur-sm">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <CardHeader>
                  <CardTitle>Dog Details</CardTitle>
                  <CardDescription>
                    Enter your dog's age and size to see their age in human years.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dog's Age (years)</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="e.g., 5" {...field} value={field.value ?? ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="size"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dog Size</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a size" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="small">Small (0-20 lbs)</SelectItem>
                            <SelectItem value="medium">Medium (21-50 lbs)</SelectItem>
                            <SelectItem value="large">Large (51+ lbs)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                    <PawPrint className="mr-2 h-4 w-4" />
                    Calculate
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </div>
      )}
      
      {appState === 'loading' && (
        <div className="space-y-4 animate-in fade-in-50 duration-500">
          <ResultCardSkeleton />
          <FactCardSkeleton />
        </div>
      )}

      {appState === 'results' && results && (
        <div className="space-y-4 animate-in fade-in-50 duration-500">
            <ResultCard humanAge={results.humanAge} dogFactReady={!!results.dogFact} />
            {results.dogFact ? <FactCard dogFact={results.dogFact} /> : <FactCardSkeleton />}
            <Button variant="outline" className="w-full" onClick={handleReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Calculate for another dog
            </Button>
        </div>
      )}
    </div>
  );
}

function ResultCard({ humanAge, dogFactReady }: { humanAge: number, dogFactReady: boolean }) {
  return (
    <Card className="w-full shadow-lg bg-gradient-to-br from-primary/80 to-primary rounded-2xl text-primary-foreground overflow-hidden">
      <div className="p-6 text-center space-y-2">
        <p className="font-medium">In human years, your dog is about...</p>
        <div className="text-7xl font-bold">
            {dogFactReady ? <CountUp end={humanAge} /> : <Loader2 className="h-20 w-20 mx-auto animate-spin" />}
        </div>
        <p className="text-sm opacity-80">years old!</p>
      </div>
    </Card>
  );
}

function ResultCardSkeleton() {
  return (
    <Card className="w-full shadow-lg bg-gradient-to-br from-primary/80 to-primary rounded-2xl text-primary-foreground overflow-hidden">
      <div className="p-6 text-center space-y-2">
        <p className="font-medium">In human years, your dog is about...</p>
        <div className="text-7xl font-bold">
            <Loader2 className="h-20 w-20 mx-auto animate-spin" />
        </div>
        <p className="text-sm opacity-80">years old!</p>
      </div>
    </Card>
  );
}

function FactCard({ dogFact }: { dogFact: DogFactOutput }) {
  return (
    <Card className="w-full shadow-lg rounded-2xl">
      <CardHeader className="flex flex-row items-center gap-4">
        <Sparkles className="h-6 w-6 text-accent" />
        <CardTitle className="text-lg">Canine Corner</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{dogFact.fact}</p>
      </CardContent>
    </Card>
  );
}

function FactCardSkeleton() {
    return (
        <Card className="w-full shadow-lg rounded-2xl">
            <CardHeader className="flex flex-row items-center gap-4">
                <Sparkles className="h-6 w-6 text-accent" />
                <CardTitle className="text-lg">Canine Corner</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </CardContent>
        </Card>
    );
}