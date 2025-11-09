import { useQueryClient } from '@tanstack/react-query'
import { useJournalAccountsQueryKey } from './use-journal-accounts-query-key'

export function useJournalAccountsInvalidate() {
  const queryClient = useQueryClient()
  const queryKey = useJournalAccountsQueryKey()

  return () => queryClient.invalidateQueries({ queryKey })
}
