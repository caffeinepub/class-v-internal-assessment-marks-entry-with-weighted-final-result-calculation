import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Award } from 'lucide-react';
import { useGetFinalSubjectResults } from '../../hooks/useResults';
import { SUBJECTS } from '../../lib/marksConstants';

interface StudentResultsScreenProps {
  student: { id: string; name: string };
  onBack: () => void;
}

export default function StudentResultsScreen({ student, onBack }: StudentResultsScreenProps) {
  const { data: results, isLoading } = useGetFinalSubjectResults(student.id);

  const grandTotal = results?.reduce((sum, r) => sum + Number(r.totalMarks), 0) || 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Student Results</h2>
          <p className="text-muted-foreground mt-1">Final marks for {student.name} (ID: {student.id})</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Final Subject Results
          </CardTitle>
          <CardDescription>Weighted marks calculated from all assessments</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {SUBJECTS.map((subject) => {
              const result = results?.find((r) => r.subject === subject.value);
              const marks = result ? Number(result.totalMarks) : 0;
              return (
                <div
                  key={subject.value}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
                >
                  <div className="font-medium">{subject.label}</div>
                  <div className="text-2xl font-bold text-primary">{marks}</div>
                </div>
              );
            })}
            <div className="flex items-center justify-between p-4 rounded-lg border-2 border-primary bg-primary/5">
              <div className="font-bold text-lg">Grand Total</div>
              <div className="text-3xl font-bold text-primary">{grandTotal}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardHeader>
          <CardTitle className="text-lg">Calculation Method</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p className="font-medium">Final marks use two-stage rounding:</p>
          <div className="space-y-2 text-muted-foreground">
            <p>
              <strong>Stage 1:</strong> FA1 + FA2 + SA1 combined (out of 100) weighted to 40 marks, then rounded up
            </p>
            <p>
              <strong>Stage 2:</strong> SA2 (out of 50) weighted to 40 marks, then rounded up
            </p>
            <p>
              <strong>Additional:</strong> Written Work (best of 2) weighted to 10 marks
            </p>
            <p>
              <strong>Additional:</strong> Project Work (best of 2) weighted to 10 marks
            </p>
          </div>
          <p className="text-muted-foreground pt-2">
            Final subject total = Combined Weighted (rounded) + SA2 Weighted (rounded) + Written Work Weighted + Project Work Weighted
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
