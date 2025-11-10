import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { JournalUiFormCreate } from './ui/journal-ui-form-create'
import { JournalUiList } from './ui/journal-ui-list'
import { JournalUiProgramExplorerLink } from './ui/journal-ui-program-explorer-link'
import { JournalUiProgramGuard } from './ui/journal-ui-program-guard'

export default function JournalFeature() {
  const { account } = useSolana()

  return (
    <JournalUiProgramGuard>
      <AppHero
        title="Journal"
        subtitle={
          account
            ? 'Create journal entries onchain. Each entry has a title and message. You can update the message or delete entries.'
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <JournalUiProgramExplorerLink />
        </p>
        {account ? (
          <JournalUiFormCreate account={account} />
        ) : (
          <div style={{ display: 'inline-block' }}>
            <WalletDropdown />
          </div>
        )}
      </AppHero>
      {account ? <JournalUiList account={account} /> : null}
    </JournalUiProgramGuard>
  )
}
