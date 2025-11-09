import { useSolana } from '@/components/solana/use-solana'

export function useJournalAccountsQueryKey() {
  const { cluster } = useSolana()

  return ['journal', 'accounts', { cluster }]
}
