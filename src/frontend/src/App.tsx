import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useUserProfile';
import { useState, useEffect } from 'react';
import LoginButton from './components/auth/LoginButton';
import ProfileSetupDialog from './components/auth/ProfileSetupDialog';
import AppLayout from './components/layout/AppLayout';
import SessionsScreen from './features/sessions/SessionsScreen';
import StudentsScreen from './features/students/StudentsScreen';
import MarksEntryScreen from './features/marks/MarksEntryScreen';
import StudentResultsScreen from './features/results/StudentResultsScreen';
import SessionResultsScreen from './features/results/SessionResultsScreen';
import SplashScreen from './components/SplashScreen';
import { Toaster } from '@/components/ui/sonner';

type View = 'sessions' | 'students' | 'marks' | 'student-results' | 'session-results';

export default function App() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const isAuthenticated = !!identity;

  const [showSplash, setShowSplash] = useState(true);
  const [currentView, setCurrentView] = useState<View>('sessions');
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [selectedStudent, setSelectedStudent] = useState<{ id: string; name: string } | null>(null);

  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  // Reset navigation when logging out
  useEffect(() => {
    if (!isAuthenticated) {
      setCurrentView('sessions');
      setSelectedSession('');
      setSelectedStudent(null);
    }
  }, [isAuthenticated]);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onContinue={() => setShowSplash(false)} />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="text-center space-y-6 p-8">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight">Class V Assessment</h1>
            <p className="text-muted-foreground text-lg">Student Marks Entry & Results System</p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AppLayout
        currentView={currentView}
        onNavigate={setCurrentView}
        selectedSession={selectedSession}
        selectedStudent={selectedStudent}
      >
        {currentView === 'sessions' && (
          <SessionsScreen
            onSessionSelect={(session) => {
              setSelectedSession(session);
              setCurrentView('students');
            }}
            selectedSession={selectedSession}
          />
        )}
        {currentView === 'students' && (
          <StudentsScreen
            session={selectedSession}
            onStudentSelect={(student) => {
              setSelectedStudent(student);
              setCurrentView('marks');
            }}
            onBack={() => setCurrentView('sessions')}
          />
        )}
        {currentView === 'marks' && selectedStudent && (
          <MarksEntryScreen
            student={selectedStudent}
            onBack={() => setCurrentView('students')}
            onViewResults={() => setCurrentView('student-results')}
          />
        )}
        {currentView === 'student-results' && selectedStudent && (
          <StudentResultsScreen
            student={selectedStudent}
            onBack={() => setCurrentView('marks')}
          />
        )}
        {currentView === 'session-results' && (
          <SessionResultsScreen
            session={selectedSession}
            onBack={() => setCurrentView('students')}
          />
        )}
      </AppLayout>
      <ProfileSetupDialog open={showProfileSetup} />
      <Toaster />
    </>
  );
}
