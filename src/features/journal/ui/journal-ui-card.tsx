import { JournalAccount } from '@project/anchor'
import { ellipsify, UiWalletAccount } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { JournalUiButtonClose } from './journal-ui-button-close'
import { JournalUiButtonDecrement } from './journal-ui-button-decrement'
import { JournalUiButtonIncrement } from './journal-ui-button-increment'
import { JournalUiButtonSet } from './journal-ui-button-set'

export function JournalUiCard({ account, journal }: { account: UiWalletAccount; journal: JournalAccount }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal: {journal.data.count}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={journal.address} label={ellipsify(journal.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 justify-evenly">
          <JournalUiButtonIncrement account={account} journal={journal} />
          <JournalUiButtonSet account={account} journal={journal} />
          <JournalUiButtonDecrement account={account} journal={journal} />
          <JournalUiButtonClose account={account} journal={journal} />
        </div>
      </CardContent>
    </Card>
  )
}
