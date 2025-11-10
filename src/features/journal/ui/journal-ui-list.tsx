import { JournalUiCard } from './journal-ui-card'
import { useJournalAccountsQuery } from '@/features/journal/data-access/use-journal-accounts-query'
import { UiWalletAccount } from '@wallet-ui/react'

export function JournalUiList({ account }: { account: UiWalletAccount }) {
  const journalAccountsQuery = useJournalAccountsQuery()

  if (journalAccountsQuery.isLoading) {
    return <span className="loading loading-spinner loading-lg"></span>
  }

  if (!journalAccountsQuery.data?.length) {
    return (
      <div className="text-center">
        <h2 className={'text-2xl'}>No journal entries</h2>
        No journal entries found. Create one to get started.
      </div>
    )
  }

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      {journalAccountsQuery.data?.map((journal) => (
        <JournalUiCard account={account} key={journal.address} journal={journal} />
      ))}
    </div>
  )
}
