import { JournalAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'
import { useJournalIncrementMutation } from '../data-access/use-journal-increment-mutation'

export function JournalUiButtonIncrement({ account, journal }: { account: UiWalletAccount; journal: JournalAccount }) {
  const incrementMutation = useJournalIncrementMutation({ account, journal })

  return (
    <Button variant="outline" onClick={() => incrementMutation.mutateAsync()} disabled={incrementMutation.isPending}>
      Increment
    </Button>
  )
}
