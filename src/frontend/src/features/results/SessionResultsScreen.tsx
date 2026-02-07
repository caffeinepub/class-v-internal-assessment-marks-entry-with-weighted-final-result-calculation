import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { useGetSessionReport } from '../../hooks/useResults';
import { SUBJECTS } from '../../lib/marksConstants';
import { Subject, AssessmentType } from '../../backend';

interface SessionResultsScreenProps {
  session: string;
  onBack: () => void;
}

interface SubjectBreakdown {
  fa1: number;
  fa2: number;
  sa1: number;
  sa2: number;
  writtenWork: number;
  projectWork: number;
  fa1Weighted: number;
  fa2Weighted: number;
  sa1Weighted: number;
  combinedWeighted: number;
  sa2Weighted: number;
  writtenWorkWeighted: number;
  projectWorkWeighted: number;
  total: number;
}

export default function SessionResultsScreen({ session, onBack }: SessionResultsScreenProps) {
  const { data: report, isLoading } = useGetSessionReport();

  const roundUpDivision = (numerator: number, denominator: number): number => {
    if (denominator === 0) return 0;
    const quotient = Math.floor(numerator / denominator);
    const remainder = numerator % denominator;
    return remainder > 0 ? quotient + 1 : quotient;
  };

  const getSubjectBreakdown = (studentId: string, subject: Subject): SubjectBreakdown => {
    const student = report?.find((r) => r.studentId === studentId);
    if (!student) {
      return {
        fa1: 0,
        fa2: 0,
        sa1: 0,
        sa2: 0,
        writtenWork: 0,
        projectWork: 0,
        fa1Weighted: 0,
        fa2Weighted: 0,
        sa1Weighted: 0,
        combinedWeighted: 0,
        sa2Weighted: 0,
        writtenWorkWeighted: 0,
        projectWorkWeighted: 0,
        total: 0,
      };
    }

    const getMarks = (assessmentType: AssessmentType): number => {
      const entry = student.marksEntries.find(
        (e) => e.subject === subject && e.assessmentType === assessmentType
      );
      return entry ? Number(entry.marks) : 0;
    };

    const fa1 = getMarks(AssessmentType.fa1);
    const fa2 = getMarks(AssessmentType.fa2);
    const sa1 = getMarks(AssessmentType.sa1);
    const sa2 = getMarks(AssessmentType.sa2);
    const ww1 = getMarks(AssessmentType.writtenWork1);
    const ww2 = getMarks(AssessmentType.writtenWork2);
    const pw1 = getMarks(AssessmentType.projectWork1);
    const pw2 = getMarks(AssessmentType.projectWork2);

    const writtenWork = Math.max(ww1, ww2);
    const projectWork = Math.max(pw1, pw2);

    // Two-stage rounding
    const combinedTotal = fa1 + fa2 + sa1;
    const combinedFullMarks = 100; // 25+25+50
    const combinedWeighted = roundUpDivision(combinedTotal * 40, combinedFullMarks);

    const sa2Weighted = roundUpDivision(sa2 * 40, 50);

    const writtenWorkWeighted = Math.floor((writtenWork * 10) / 10);
    const projectWorkWeighted = Math.floor((projectWork * 10) / 20);

    const total = combinedWeighted + sa2Weighted + writtenWorkWeighted + projectWorkWeighted;

    return {
      fa1,
      fa2,
      sa1,
      sa2,
      writtenWork,
      projectWork,
      fa1Weighted: Math.floor((fa1 * 40) / 100),
      fa2Weighted: Math.floor((fa2 * 40) / 100),
      sa1Weighted: Math.floor((sa1 * 40) / 100),
      combinedWeighted,
      sa2Weighted,
      writtenWorkWeighted,
      projectWorkWeighted,
      total,
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h2 className="text-3xl font-bold tracking-tight">Final Results Sheet</h2>
          <p className="text-muted-foreground mt-1">Detailed marks breakdown for all students - {session}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            Complete Assessment Results
          </CardTitle>
          <CardDescription>
            Raw marks, weightage marks, and final totals for all subjects
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!report || report.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No results available yet. Enter marks for students to see results.
            </div>
          ) : (
            <div className="space-y-8">
              {report.map((student) => {
                const grandTotal = SUBJECTS.reduce((sum, subject) => {
                  return sum + getSubjectBreakdown(student.studentId, subject.value).total;
                }, 0);

                return (
                  <div key={student.studentId} className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border-2 border-primary/20">
                      <h3 className="text-xl font-bold">Student ID: {student.studentId}</h3>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">Grand Total</div>
                        <div className="text-3xl font-bold text-primary">{grandTotal}</div>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b-2">
                            <th className="text-left p-3 font-semibold bg-muted/50 min-w-[180px]">Subject</th>
                            <th className="text-center p-3 font-semibold bg-muted/50 min-w-[80px]">FA1</th>
                            <th className="text-center p-3 font-semibold bg-muted/50 min-w-[80px]">FA2</th>
                            <th className="text-center p-3 font-semibold bg-muted/50 min-w-[80px]">SA1</th>
                            <th className="text-center p-3 font-semibold bg-accent/20 min-w-[100px]">
                              Combined
                              <br />
                              <span className="text-xs font-normal">(Weightage)</span>
                            </th>
                            <th className="text-center p-3 font-semibold bg-muted/50 min-w-[80px]">SA2</th>
                            <th className="text-center p-3 font-semibold bg-accent/20 min-w-[100px]">
                              SA2
                              <br />
                              <span className="text-xs font-normal">(Weightage)</span>
                            </th>
                            <th className="text-center p-3 font-semibold bg-muted/50 min-w-[100px]">
                              Written
                              <br />
                              Work
                            </th>
                            <th className="text-center p-3 font-semibold bg-accent/20 min-w-[100px]">
                              WW
                              <br />
                              <span className="text-xs font-normal">(Weightage)</span>
                            </th>
                            <th className="text-center p-3 font-semibold bg-muted/50 min-w-[100px]">
                              Project
                              <br />
                              Work
                            </th>
                            <th className="text-center p-3 font-semibold bg-accent/20 min-w-[100px]">
                              PW
                              <br />
                              <span className="text-xs font-normal">(Weightage)</span>
                            </th>
                            <th className="text-center p-3 font-semibold bg-primary/20 min-w-[100px]">
                              Subject
                              <br />
                              Total
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {SUBJECTS.map((subject) => {
                            const breakdown = getSubjectBreakdown(student.studentId, subject.value);
                            return (
                              <tr key={subject.value} className="border-b hover:bg-muted/20 transition-colors">
                                <td className="p-3 font-medium">{subject.label}</td>
                                <td className="text-center p-3">{breakdown.fa1 || '—'}</td>
                                <td className="text-center p-3">{breakdown.fa2 || '—'}</td>
                                <td className="text-center p-3">{breakdown.sa1 || '—'}</td>
                                <td className="text-center p-3 bg-accent/10 font-semibold">
                                  {breakdown.combinedWeighted || '—'}
                                </td>
                                <td className="text-center p-3">{breakdown.sa2 || '—'}</td>
                                <td className="text-center p-3 bg-accent/10 font-semibold">
                                  {breakdown.sa2Weighted || '—'}
                                </td>
                                <td className="text-center p-3">{breakdown.writtenWork || '—'}</td>
                                <td className="text-center p-3 bg-accent/10 font-semibold">
                                  {breakdown.writtenWorkWeighted || '—'}
                                </td>
                                <td className="text-center p-3">{breakdown.projectWork || '—'}</td>
                                <td className="text-center p-3 bg-accent/10 font-semibold">
                                  {breakdown.projectWorkWeighted || '—'}
                                </td>
                                <td className="text-center p-3 bg-primary/10 font-bold text-primary">
                                  {breakdown.total || '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
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
