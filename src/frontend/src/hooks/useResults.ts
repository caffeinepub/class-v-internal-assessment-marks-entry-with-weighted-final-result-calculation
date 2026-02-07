import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { FinalSubjectResult, FinalSessionResult } from '../backend';

export function useGetFinalSubjectResults(studentId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FinalSubjectResult[]>({
    queryKey: ['finalSubjectResults', studentId],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getFinalSubjectResults(studentId);
    },
    enabled: !!actor && !actorFetching && !!studentId,
  });
}

export function useGetSessionReport() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FinalSessionResult[]>({
    queryKey: ['sessionReport'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getSessionReport();
    },
    enabled: !!actor && !actorFetching,
  });
}
