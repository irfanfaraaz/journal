import { useSolana } from '@/components/solana/use-solana'
import { WalletDropdown } from '@/components/wallet-dropdown'
import { AppHero } from '@/components/app-hero'
import { JournalUiButtonInitialize } from './ui/journal-ui-button-initialize'
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
            ? "Initialize a new journal onchain by clicking the button. Use the program's methods (increment, decrement, set, and close) to change the state of the account."
            : 'Select a wallet to run the program.'
        }
      >
        <p className="mb-6">
          <JournalUiProgramExplorerLink />
        </p>
        {account ? (
          <JournalUiButtonInitialize account={account} />
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
