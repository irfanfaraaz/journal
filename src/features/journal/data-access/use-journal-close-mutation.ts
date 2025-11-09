import { JournalAccount, getDeleteJournalEntryInstructionAsync } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { toastTx } from '@/components/toast-tx'
import { useJournalAccountsInvalidate } from './use-journal-accounts-invalidate'

export function useJournalCloseMutation({ account, journal }: { account: UiWalletAccount; journal: JournalAccount }) {
  const invalidateAccounts = useJournalAccountsInvalidate()
  const signAndSend = useWalletUiSignAndSend()
  const signer = useWalletUiSigner({ account })

  return useMutation({
    mutationFn: async () => {
      const title = journal.data.title
      const ix = await getDeleteJournalEntryInstructionAsync({ owner: signer, journalEntry: journal.address, title })
      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
