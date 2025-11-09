import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  getProgramDerivedAddress,
  getUtf8Encoder,
  getAddressEncoder,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  getCreateJournalEntryInstructionAsync,
  getUpdateJournalEntryInstructionAsync,
  getDeleteJournalEntryInstructionAsync,
  fetchJournalEntryState,
  JOURNAL_PROGRAM_ADDRESS,
} from '../src'
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

// Helper function to derive PDA using raw bytes (matching Rust's title.as_bytes())
async function deriveJournalEntryPDA(title: string, owner: KeyPairSigner) {
  const [pda] = await getProgramDerivedAddress({
    programAddress: JOURNAL_PROGRAM_ADDRESS,
    seeds: [getUtf8Encoder().encode(title), getAddressEncoder().encode(owner.address)],
  })
  return pda
}

describe('journal', () => {
  let payer: KeyPairSigner

  beforeAll(async () => {
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Create Journal Entry', async () => {
    // ARRANGE
    expect.assertions(3)
    const title = 'My First Entry'
    const message = 'This is my first journal entry!'
    const journalEntryPDA = await deriveJournalEntryPDA(title, payer)
    const ix = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const journalEntry = await fetchJournalEntryState(rpc, ix.accounts[1].address)
    expect(journalEntry.data.owner).toEqual(payer.address)
    expect(journalEntry.data.title).toEqual(title)
    expect(journalEntry.data.message).toEqual(message)
  })

  it('Create Multiple Journal Entries', async () => {
    // ARRANGE
    expect.assertions(6)
    const title1 = 'Entry 1'
    const message1 = 'First entry message'
    const title2 = 'Entry 2'
    const message2 = 'Second entry message'

    const journalEntryPDA1 = await deriveJournalEntryPDA(title1, payer)
    const journalEntryPDA2 = await deriveJournalEntryPDA(title2, payer)

    const ix1 = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA1,
      title: title1,
      message: message1,
    })
    const ix2 = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA2,
      title: title2,
      message: message2,
    })

    // ACT
    await sendAndConfirm({ ix: ix1, payer })
    await sendAndConfirm({ ix: ix2, payer })

    // ASSERT
    const entry1 = await fetchJournalEntryState(rpc, ix1.accounts[1].address)
    const entry2 = await fetchJournalEntryState(rpc, ix2.accounts[1].address)

    expect(entry1.data.title).toEqual(title1)
    expect(entry1.data.message).toEqual(message1)
    expect(entry2.data.title).toEqual(title2)
    expect(entry2.data.message).toEqual(message2)
    expect(entry1.data.owner).toEqual(payer.address)
    expect(entry2.data.owner).toEqual(payer.address)
  })

  it('Update Journal Entry', async () => {
    // ARRANGE
    expect.assertions(2)
    const title = 'Update Test Entry'
    const initialMessage = 'Initial message'
    const updatedMessage = 'Updated message content'

    const journalEntryPDA = await deriveJournalEntryPDA(title, payer)
    const createIx = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message: initialMessage,
    })
    await sendAndConfirm({ ix: createIx, payer })

    const updateIx = await getUpdateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message: updatedMessage,
    })

    // ACT
    await sendAndConfirm({ ix: updateIx, payer })

    // ASSERT
    const journalEntry = await fetchJournalEntryState(rpc, journalEntryPDA)
    expect(journalEntry.data.title).toEqual(title)
    expect(journalEntry.data.message).toEqual(updatedMessage)
  })

  it('Update Journal Entry Multiple Times', async () => {
    // ARRANGE
    expect.assertions(3)
    const title = 'Multiple Updates Entry'
    const message1 = 'First update'
    const message2 = 'Second update'
    const message3 = 'Third update'

    const journalEntryPDA = await deriveJournalEntryPDA(title, payer)
    const createIx = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message: 'Initial',
    })
    await sendAndConfirm({ ix: createIx, payer })

    // ACT
    const updateIx1 = await getUpdateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message: message1,
    })
    await sendAndConfirm({ ix: updateIx1, payer })

    const updateIx2 = await getUpdateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message: message2,
    })
    await sendAndConfirm({ ix: updateIx2, payer })

    const updateIx3 = await getUpdateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message: message3,
    })
    await sendAndConfirm({ ix: updateIx3, payer })

    // ASSERT
    const journalEntry = await fetchJournalEntryState(rpc, journalEntryPDA)
    expect(journalEntry.data.message).toEqual(message3)
    expect(journalEntry.data.title).toEqual(title)
    expect(journalEntry.data.owner).toEqual(payer.address)
  })

  it('Delete Journal Entry', async () => {
    // ARRANGE
    expect.assertions(1)
    const title = 'Delete Test Entry'
    const message = 'This entry will be deleted'

    const journalEntryPDA = await deriveJournalEntryPDA(title, payer)
    const createIx = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message,
    })
    await sendAndConfirm({ ix: createIx, payer })

    const deleteIx = await getDeleteJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
    })

    // ACT
    await sendAndConfirm({ ix: deleteIx, payer })

    // ASSERT
    try {
      await fetchJournalEntryState(rpc, createIx.accounts[1].address)
      expect.fail('Account should not exist after deletion')
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toContain('Account not found')
    }
  })

  it('Create, Update, and Delete Journal Entry Flow', async () => {
    // ARRANGE
    expect.assertions(3)
    const title = 'Full Flow Entry'
    const initialMessage = 'Initial message'
    const updatedMessage = 'Updated message'

    const journalEntryPDA = await deriveJournalEntryPDA(title, payer)

    // Create
    const createIx = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message: initialMessage,
    })
    await sendAndConfirm({ ix: createIx, payer })

    let entry = await fetchJournalEntryState(rpc, journalEntryPDA)
    expect(entry.data.message).toEqual(initialMessage)

    // Update
    const updateIx = await getUpdateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message: updatedMessage,
    })
    await sendAndConfirm({ ix: updateIx, payer })

    entry = await fetchJournalEntryState(rpc, journalEntryPDA)
    expect(entry.data.message).toEqual(updatedMessage)

    // Delete
    const deleteIx = await getDeleteJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
    })
    await sendAndConfirm({ ix: deleteIx, payer })

    // ASSERT
    try {
      await fetchJournalEntryState(rpc, journalEntryPDA)
      expect.fail('Account should not exist after deletion')
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toContain('Account not found')
    }
  })

  it('Journal Entry with Max Length Title and Message', async () => {
    // ARRANGE
    expect.assertions(2)
    // Title max 32 bytes for PDA seeds (Solana limit)
    // Even though field allows 50 bytes (max_len(50)), PDA seed limit is 32 bytes
    const title = 'A'.repeat(32) // Max length for PDA seed (raw bytes, no prefix)
    // Message reduced to fit within transaction size limits (max_len(1000) allows up to 1000 bytes)
    const message = 'B'.repeat(500) // Large message that fits in transaction

    const journalEntryPDA = await deriveJournalEntryPDA(title, payer)
    const ix = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const journalEntry = await fetchJournalEntryState(rpc, journalEntryPDA)
    expect(journalEntry.data.title).toEqual(title)
    expect(journalEntry.data.message).toEqual(message)
  })

  it('Journal Entry with Special Characters', async () => {
    // ARRANGE
    expect.assertions(2)
    // Title must be ≤ 32 bytes for PDA seeds (raw UTF-8 bytes)
    const title = 'Entry 🎉 & symbols!' // ~20 bytes (emoji is 4 bytes in UTF-8)
    const message = 'Message with "quotes", \'apostrophes\', and newlines\nand tabs\t!'

    const journalEntryPDA = await deriveJournalEntryPDA(title, payer)
    const ix = await getCreateJournalEntryInstructionAsync({
      owner: payer,
      journalEntry: journalEntryPDA,
      title,
      message,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const journalEntry = await fetchJournalEntryState(rpc, journalEntryPDA)
    expect(journalEntry.data.title).toEqual(title)
    expect(journalEntry.data.message).toEqual(message)
  })
})

// Helper function to keep the tests DRY
let latestBlockhash: Awaited<ReturnType<typeof getLatestBlockhash>> | undefined
async function getLatestBlockhash(): Promise<Readonly<{ blockhash: Blockhash; lastValidBlockHeight: bigint }>> {
  if (latestBlockhash) {
    return latestBlockhash
  }
  return await rpc
    .getLatestBlockhash()
    .send()
    .then(({ value }) => value)
}
async function sendAndConfirm({ ix, payer }: { ix: Instruction; payer: KeyPairSigner }) {
  const tx = createTransaction({
    feePayer: payer,
    instructions: [ix],
    version: 'legacy',
    latestBlockhash: await getLatestBlockhash(),
  })
  const signedTransaction = await signTransactionMessageWithSigners(tx)
  return await sendAndConfirmTransaction(signedTransaction)
}
