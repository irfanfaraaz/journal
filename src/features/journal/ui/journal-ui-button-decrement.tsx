import { JournalAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useJournalDecrementMutation } from '../data-access/use-journal-decrement-mutation'

export function JournalUiButtonDecrement({ account, journal }: { account: UiWalletAccount; journal: JournalAccount }) {
  const decrementMutation = useJournalDecrementMutation({ account, journal })

  return (
    <Button variant="outline" onClick={() => decrementMutation.mutateAsync()} disabled={decrementMutation.isPending}>
      Decrement
    </Button>
  )
}
