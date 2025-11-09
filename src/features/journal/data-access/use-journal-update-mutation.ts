import { JournalAccount, getUpdateJournalEntryInstructionAsync } from '@project/anchor'
import { useMutation } from '@tanstack/react-query'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { toastTx } from '@/components/toast-tx'
import { useJournalAccountsInvalidate } from './use-journal-accounts-invalidate'

export function useJournalUpdateMutation({ account, journal }: { account: UiWalletAccount; journal: JournalAccount }) {
  const invalidateAccounts = useJournalAccountsInvalidate()
  const signer = useWalletUiSigner({ account })
  const signAndSend = useWalletUiSignAndSend()
  return useMutation({
    mutationFn: async ({ message }: { message: string }) => {
      const title = journal.data.title
      const ix = await getUpdateJournalEntryInstructionAsync({
        owner: signer,
        journalEntry: journal.address,
        title,
        message,
      })
      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
  })
}
