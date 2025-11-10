'use client'

import { useState } from 'react'
import { JournalAccount } from '@project/anchor'
import { ellipsify, UiWalletAccount } from '@wallet-ui/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { AppExplorerLink } from '@/components/app-explorer-link'
import { JournalUiButtonClose } from './journal-ui-button-close'
import { JournalUiFormUpdate } from './journal-ui-form-update'

export function JournalUiCard({ account, journal }: { account: UiWalletAccount; journal: JournalAccount }) {
  const [isUpdateDialogOpen, setIsUpdateDialogOpen] = useState(false)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{journal.data.title}</CardTitle>
        <CardDescription>
          Account: <AppExplorerLink address={journal.address} label={ellipsify(journal.address)} />
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground whitespace-pre-wrap wrap-break-word">{journal.data.message}</div>
        <div className="flex gap-4 justify-end">
          <Dialog open={isUpdateDialogOpen} onOpenChange={setIsUpdateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                Update
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Update Journal Entry</DialogTitle>
                <DialogDescription>Update the message for &quot;{journal.data.title}&quot;</DialogDescription>
              </DialogHeader>
              <JournalUiFormUpdate account={account} journal={journal} onSuccess={() => setIsUpdateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
          <JournalUiButtonClose account={account} journal={journal} />
        </div>
      </CardContent>
    </Card>
  )
}
