import { useEffect, useState } from 'react';
import { BookOpen } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
}

export default function SplashScreen({ onContinue }: SplashScreenProps) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFadeOut(true);
      setTimeout(onContinue, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onContinue]);

  return (
    <div
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 transition-opacity duration-500 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="text-center space-y-8 p-8 max-w-2xl">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-2xl bg-primary/10 flex items-center justify-center animate-pulse">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
        </div>
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Class V Assessment System
          </h1>
          <p className="text-2xl text-muted-foreground font-medium">
            By Ratnakara Ranbida
          </p>
        </div>
      </div>
    </div>
  );
}
