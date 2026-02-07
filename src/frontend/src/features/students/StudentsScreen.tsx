import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Student {
  id: string;
  name: string;
  rollNo?: string;
}

interface StudentsScreenProps {
  session: string;
  onStudentSelect: (student: { id: string; name: string }) => void;
  onBack: () => void;
}

export default function StudentsScreen({ session, onStudentSelect, onBack }: StudentsScreenProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: '', name: '', rollNo: '' });

  useEffect(() => {
    const stored = localStorage.getItem(`students_${session}`);
    if (stored) {
      setStudents(JSON.parse(stored));
    }
  }, [session]);

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.id.trim() || !formData.name.trim()) {
      toast.error('Please enter student ID and name');
      return;
    }
    if (students.some((s) => s.id === formData.id.trim())) {
      toast.error('Student ID already exists');
      return;
    }
    const newStudent: Student = {
      id: formData.id.trim(),
      name: formData.name.trim(),
      rollNo: formData.rollNo.trim() || undefined,
    };
    const updated = [...students, newStudent];
    setStudents(updated);
    localStorage.setItem(`students_${session}`, JSON.stringify(updated));
    toast.success('Student added successfully');
    setFormData({ id: '', name: '', rollNo: '' });
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Students - {session}</h2>
          <p className="text-muted-foreground mt-1">Manage students and enter their marks</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Student</CardTitle>
            <CardDescription>Enter student details</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="studentId">Student ID *</Label>
                  <Input
                    id="studentId"
                    placeholder="e.g., S001"
                    value={formData.id}
                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                    autoFocus
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rollNo">Roll Number</Label>
                  <Input
                    id="rollNo"
                    placeholder="Optional"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Student Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Student</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {students.length === 0 && !showForm && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No students yet. Add students to start entering marks.</p>
            </CardContent>
          </Card>
        )}
        {students.map((student) => (
          <Card
            key={student.id}
            className="cursor-pointer transition-all hover:shadow-md"
            onClick={() => onStudentSelect({ id: student.id, name: student.name })}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                {student.name}
              </CardTitle>
              <CardDescription>
                ID: {student.id}
                {student.rollNo && ` • Roll: ${student.rollNo}`}
              </CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
