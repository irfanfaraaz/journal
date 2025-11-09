import { Button } from '@/components/ui/button'
import { UiWalletAccount } from '@wallet-ui/react'

import { useJournalInitializeMutation } from '@/features/journal/data-access/use-journal-initialize-mutation'

export function JournalUiButtonInitialize({ account }: { account: UiWalletAccount }) {
  const mutationInitialize = useJournalInitializeMutation({ account })

  return (
    <Button onClick={() => mutationInitialize.mutateAsync()} disabled={mutationInitialize.isPending}>
      Initialize Journal {mutationInitialize.isPending && '...'}
    </Button>
  )
}
