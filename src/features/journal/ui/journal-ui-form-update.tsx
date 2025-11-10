'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { JournalAccount } from '@project/anchor'
import { UiWalletAccount } from '@wallet-ui/react'
import { useJournalUpdateMutation } from '@/features/journal/data-access/use-journal-update-mutation'

export function JournalUiFormUpdate({
  account,
  journal,
  onSuccess,
}: {
  account: UiWalletAccount
  journal: JournalAccount
  onSuccess?: () => void
}) {
  const [message, setMessage] = useState(journal.data.message)
  const updateMutation = useJournalUpdateMutation({ account, journal })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim()) {
      return
    }
    // Message max 1000 bytes per max_len(1000)
    if (new TextEncoder().encode(message).length > 1000) {
      alert('Message must be 1000 bytes or less')
      return
    }
    try {
      await updateMutation.mutateAsync({ message: message.trim() })
      onSuccess?.()
    } catch {
      // Error is handled by onError in mutation
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="update-message">Message (max 1000 bytes)</Label>
        <textarea
          id="update-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter journal entry message"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          maxLength={1000}
          required
          disabled={updateMutation.isPending}
        />
        <p className="text-xs text-muted-foreground">{new TextEncoder().encode(message).length} / 1000 bytes</p>
      </div>
      <Button type="submit" disabled={updateMutation.isPending || !message.trim()}>
        {updateMutation.isPending ? 'Updating...' : 'Update Entry'}
      </Button>
    </form>
  )
}
