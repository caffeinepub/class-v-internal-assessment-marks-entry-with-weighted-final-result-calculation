import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Calendar } from 'lucide-react';
import { toast } from 'sonner';

interface SessionsScreenProps {
  onSessionSelect: (session: string) => void;
  selectedSession: string;
}

export default function SessionsScreen({ onSessionSelect, selectedSession }: SessionsScreenProps) {
  const [sessions, setSessions] = useState<string[]>([]);
  const [newSession, setNewSession] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sessions');
    if (stored) {
      setSessions(JSON.parse(stored));
    }
  }, []);

  const handleAddSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSession.trim()) {
      toast.error('Please enter a session name');
      return;
    }
    if (sessions.includes(newSession.trim())) {
      toast.error('Session already exists');
      return;
    }
    const updated = [...sessions, newSession.trim()];
    setSessions(updated);
    localStorage.setItem('sessions', JSON.stringify(updated));
    toast.success('Session created successfully');
    setNewSession('');
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Academic Sessions</h2>
          <p className="text-muted-foreground mt-1">Select or create a session to manage student marks</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Session
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>Enter the academic year (e.g., 2025-26)</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSession} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="session">Session Name</Label>
                <Input
                  id="session"
                  placeholder="e.g., 2025-26"
                  value={newSession}
                  onChange={(e) => setNewSession(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Session</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sessions.length === 0 && !showForm && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No sessions yet. Create one to get started.</p>
            </CardContent>
          </Card>
        )}
        {sessions.map((session) => (
          <Card
            key={session}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedSession === session ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => onSessionSelect(session)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                {session}
              </CardTitle>
              <CardDescription>Academic Year</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
