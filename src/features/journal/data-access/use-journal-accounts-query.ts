import { useSolana } from '@/components/solana/use-solana'
import { useQuery } from '@tanstack/react-query'
import { getJournalProgramAccounts } from '@project/anchor'
import { useJournalAccountsQueryKey } from './use-journal-accounts-query-key'

export function useJournalAccountsQuery() {
  const { client } = useSolana()

  return useQuery({
    queryKey: useJournalAccountsQueryKey(),
    queryFn: async () => await getJournalProgramAccounts(client.rpc),
  })
}
