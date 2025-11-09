import { JournalAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useJournalSetMutation } from '@/features/journal/data-access/use-journal-set-mutation'

export function JournalUiButtonSet({ account, journal }: { account: UiWalletAccount; journal: JournalAccount }) {
  const setMutation = useJournalSetMutation({ account, journal })

  return (
    <Button
      variant="outline"
      onClick={() => {
        const value = window.prompt('Set value to:', journal.data.count.toString() ?? '0')
        if (!value || parseInt(value) === journal.data.count || isNaN(parseInt(value))) {
          return
        }
        return setMutation.mutateAsync(parseInt(value))
      }}
      disabled={setMutation.isPending}
    >
      Set
    </Button>
  )
}
