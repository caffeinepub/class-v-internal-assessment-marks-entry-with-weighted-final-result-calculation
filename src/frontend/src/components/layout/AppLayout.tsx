import { ReactNode } from 'react';
import LoginButton from '../auth/LoginButton';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, FileText, BarChart3 } from 'lucide-react';

type View = 'sessions' | 'students' | 'marks' | 'student-results' | 'session-results';

interface AppLayoutProps {
  children: ReactNode;
  currentView: View;
  onNavigate: (view: View) => void;
  selectedSession: string;
  selectedStudent: { id: string; name: string } | null;
}

export default function AppLayout({
  children,
  currentView,
  onNavigate,
  selectedSession,
  selectedStudent,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight">Class V Assessment</h1>
                <p className="text-xs text-muted-foreground">Marks Entry & Results</p>
              </div>
            </div>
            <LoginButton />
          </div>
        </div>
      </header>

      <nav className="border-b bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2">
            <Button
              variant={currentView === 'sessions' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onNavigate('sessions')}
              className="gap-2 shrink-0"
            >
              <FileText className="h-4 w-4" />
              Sessions
            </Button>
            {selectedSession && (
              <>
                <Button
                  variant={currentView === 'students' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('students')}
                  className="gap-2 shrink-0"
                >
                  <Users className="h-4 w-4" />
                  Students
                </Button>
                <Button
                  variant={currentView === 'session-results' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => onNavigate('session-results')}
                  className="gap-2 shrink-0"
                >
                  <BarChart3 className="h-4 w-4" />
                  Final Results Sheet
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>

      <footer className="border-t bg-muted/30 py-4 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026. Built with ❤️ using{' '}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </div>
      </footer>
    </div>
  );
}
