import { toastTx } from '@/components/toast-tx'
import { JOURNAL_PROGRAM_ADDRESS, getCreateJournalEntryInstructionAsync } from '@project/anchor'
import { install as installEd25519 } from '@solana/webcrypto-ed25519-polyfill'
import { useMutation } from '@tanstack/react-query'
import { UiWalletAccount, useWalletUiSigner } from '@wallet-ui/react'
import { useWalletUiSignAndSend } from '@wallet-ui/react-gill'
import { Address, getAddressEncoder, getProgramDerivedAddress, getUtf8Encoder } from 'gill'
import { toast } from 'sonner'
import { useJournalAccountsInvalidate } from './use-journal-accounts-invalidate'

// polyfill ed25519 for browsers (to allow `generateKeyPairSigner` to work)
installEd25519()

async function deriveJournalEntryPDA(title: string, ownerAddress: Address<string>) {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JOURNAL_PROGRAM_ADDRESS,
    seeds: [
      getUtf8Encoder().encode(title), // Raw UTF-8 bytes, no length prefix (matching Rust)
      getAddressEncoder().encode(ownerAddress),
    ],
  })
  return pda
}

export function useJournalCreateMutation({ account }: { account: UiWalletAccount }) {
  const invalidateAccounts = useJournalAccountsInvalidate()

  const signer = useWalletUiSigner({ account })
  const signAndSend = useWalletUiSignAndSend()

  return useMutation({
    mutationFn: async ({ title, message }: { title: string; message: string }) => {
      const journalEntryPDA = await deriveJournalEntryPDA(title, signer.address)

      const ix = await getCreateJournalEntryInstructionAsync({
        owner: signer,
        journalEntry: journalEntryPDA,
        title,
        message,
      })
      return await signAndSend(ix, signer)
    },
    onSuccess: async (tx) => {
      toastTx(tx)
      await invalidateAccounts()
    },
    onError: () => toast.error('Failed to run program'),
  })
}
