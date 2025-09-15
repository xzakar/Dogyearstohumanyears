import { Dog } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { WoofYearsApp } from '@/components/woof-years-app';

export default function Home() {
  return (
    <div className="relative flex min-h-screen w-full flex-col items-center justify-center bg-background p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <main className="w-full max-w-md">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="rounded-full bg-primary/20 p-4">
            <Dog className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl font-headline">
            Dog Years To Human Years
          </h1>
          <p className="text-muted-foreground md:text-xl">
            Ever wondered how old your dog is in human years?
          </p>
        </div>

        <WoofYearsApp />
      </main>
    </div>
  );
}
