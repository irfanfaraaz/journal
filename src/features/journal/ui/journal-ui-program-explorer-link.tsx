import { JOURNAL_PROGRAM_ADDRESS } from '@project/anchor'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { ellipsify } from '@wallet-ui/react'

export function JournalUiProgramExplorerLink() {
  return <AppExplorerLink address={JOURNAL_PROGRAM_ADDRESS} label={ellipsify(JOURNAL_PROGRAM_ADDRESS)} />
}
