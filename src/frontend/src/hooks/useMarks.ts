import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { MarkEntry, Subject, AssessmentType } from '../backend';

export function useGetRawMarks(studentId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MarkEntry[]>({
    queryKey: ['rawMarks', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRawMarks(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useSubmitMarks() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      studentId,
      subject,
      assessmentType,
      marks,
    }: {
      studentId: string;
      subject: Subject;
      assessmentType: AssessmentType;
      marks: bigint;
    }) => {
      if (!actor) throw new Error('Actor not available');
      await actor.submitMarks(studentId, subject, assessmentType, marks);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['rawMarks', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['finalSubjectResults', variables.studentId] });
      queryClient.invalidateQueries({ queryKey: ['sessionReport'] });
    },
  });
}
