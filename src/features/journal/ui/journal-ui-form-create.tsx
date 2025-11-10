'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { UiWalletAccount } from '@wallet-ui/react'
import { useJournalCreateMutation } from '@/features/journal/data-access/use-journal-create-mutation'

export function JournalUiFormCreate({ account }: { account: UiWalletAccount }) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const createMutation = useJournalCreateMutation({ account })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !message.trim()) {
      return
    }
    // Title max 32 bytes for PDA seeds (raw UTF-8 bytes)
    if (new TextEncoder().encode(title).length > 32) {
      alert('Title must be 32 bytes or less (for PDA seed limit)')
      return
    }
    // Message max 1000 bytes per max_len(1000)
    if (new TextEncoder().encode(message).length > 1000) {
      alert('Message must be 1000 bytes or less')
      return
    }
    try {
      await createMutation.mutateAsync({ title: title.trim(), message: message.trim() })
      setTitle('')
      setMessage('')
    } catch {
      // Error is handled by onError in mutation
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="title">Title (max 32 bytes)</Label>
        <Input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter journal entry title"
          maxLength={32}
          required
          disabled={createMutation.isPending}
        />
        <p className="text-xs text-muted-foreground">{new TextEncoder().encode(title).length} / 32 bytes</p>
      </div>
      <div className="space-y-2">
        <Label htmlFor="message">Message (max 1000 bytes)</Label>
        <textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter journal entry message"
          className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
          maxLength={1000}
          required
          disabled={createMutation.isPending}
        />
        <p className="text-xs text-muted-foreground">{new TextEncoder().encode(message).length} / 1000 bytes</p>
      </div>
      <Button type="submit" disabled={createMutation.isPending || !title.trim() || !message.trim()}>
        {createMutation.isPending ? 'Creating...' : 'Create Journal Entry'}
      </Button>
    </form>
  )
}
