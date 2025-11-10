import { JournalAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { Button } from '@/components/ui/button'

import { useJournalCloseMutation } from '@/features/journal/data-access/use-journal-close-mutation'

export function JournalUiButtonClose({ account, journal }: { account: UiWalletAccount; journal: JournalAccount }) {
  const closeMutation = useJournalCloseMutation({ account, journal })

  return (
    <Button
      variant="destructive"
      onClick={() => {
        if (!window.confirm('Are you sure you want to delete this journal entry?')) {
          return
        }
        return closeMutation.mutateAsync()
      }}
      disabled={closeMutation.isPending}
    >
      Delete
    </Button>
  )
}
