import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useGetRawMarks, useSubmitMarks } from '../../hooks/useMarks';
import { SUBJECTS, ASSESSMENTS, getFullMarks } from '../../lib/marksConstants';
import { validateMarks } from '../../lib/marksValidation';
import { Subject, AssessmentType } from '../../backend';

interface MarksEntryScreenProps {
  student: { id: string; name: string };
  onBack: () => void;
  onViewResults: () => void;
}

export default function MarksEntryScreen({ student, onBack, onViewResults }: MarksEntryScreenProps) {
  const { data: rawMarks, isLoading } = useGetRawMarks(student.id);
  const submitMarks = useSubmitMarks();

  const [marks, setMarks] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (rawMarks) {
      const marksMap: Record<string, string> = {};
      rawMarks.forEach((entry) => {
        const key = `${entry.subject}_${entry.assessmentType}`;
        marksMap[key] = entry.marks.toString();
      });
      setMarks(marksMap);
    }
  }, [rawMarks]);

  const handleMarkChange = (subject: Subject, assessment: AssessmentType, value: string) => {
    const key = `${subject}_${assessment}`;
    setMarks({ ...marks, [key]: value });

    const fullMarks = getFullMarks(assessment);
    const error = validateMarks(value, fullMarks);
    setErrors({ ...errors, [key]: error || '' });
  };

  const handleSave = async () => {
    const hasErrors = Object.values(errors).some((e) => e);
    if (hasErrors) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    try {
      const promises: Promise<void>[] = [];
      for (const [key, value] of Object.entries(marks)) {
        if (value.trim() === '') continue;
        const [subject, assessment] = key.split('_') as [Subject, AssessmentType];
        promises.push(
          submitMarks.mutateAsync({
            studentId: student.id,
            subject,
            assessmentType: assessment,
            marks: BigInt(parseInt(value)),
          })
        );
      }
      await Promise.all(promises);
      toast.success('Marks saved successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to save marks');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Marks Entry</h2>
          <p className="text-muted-foreground mt-1">Student: {student.name} (ID: {student.id})</p>
        </div>
        <Button variant="outline" onClick={onViewResults} className="gap-2">
          <Eye className="h-4 w-4" />
          View Results
        </Button>
        <Button onClick={handleSave} disabled={submitMarks.isPending} className="gap-2">
          <Save className="h-4 w-4" />
          {submitMarks.isPending ? 'Saving...' : 'Save Marks'}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Marks</CardTitle>
          <CardDescription>Enter marks for each subject and assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-semibold bg-muted/50">Subject</th>
                  {ASSESSMENTS.map((assessment) => (
                    <th key={assessment.type} className="text-center p-3 font-semibold bg-muted/50 min-w-[100px]">
                      <div>{assessment.label}</div>
                      <div className="text-xs font-normal text-muted-foreground">/{assessment.fullMarks}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SUBJECTS.map((subject) => (
                  <tr key={subject.value} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{subject.label}</td>
                    {ASSESSMENTS.map((assessment) => {
                      const key = `${subject.value}_${assessment.type}`;
                      const value = marks[key] || '';
                      const error = errors[key];
                      return (
                        <td key={assessment.type} className="p-2">
                          <div className="space-y-1">
                            <Input
                              type="number"
                              min="0"
                              max={assessment.fullMarks}
                              value={value}
                              onChange={(e) =>
                                handleMarkChange(subject.value, assessment.type, e.target.value)
                              }
                              className={`text-center ${error ? 'border-destructive' : ''}`}
                              placeholder="—"
                            />
                            {error && <p className="text-xs text-destructive">{error}</p>}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Assessment Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="grid gap-2 md:grid-cols-2">
            <div>
              <strong>FA1 & FA2:</strong> 25 marks each
            </div>
            <div>
              <strong>SA1 & SA2:</strong> 50 marks each
            </div>
            <div>
              <strong>Written Work:</strong> 10 marks each (2 entries)
            </div>
            <div>
              <strong>Project Work:</strong> 20 marks each (2 entries)
            </div>
          </div>
          <p className="text-muted-foreground pt-2">
            Leave fields blank if marks are not yet available. All marks must be within the specified range.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
