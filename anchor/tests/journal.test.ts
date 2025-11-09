import {
  Blockhash,
  createSolanaClient,
  createTransaction,
  generateKeyPairSigner,
  Instruction,
  isSolanaError,
  KeyPairSigner,
  signTransactionMessageWithSigners,
} from 'gill'
import {
  fetchJournal,
  getCloseInstruction,
  getDecrementInstruction,
  getIncrementInstruction,
  getInitializeInstruction,
  getSetInstruction,
} from '../src'
// @ts-ignore error TS2307 suggest setting `moduleResolution` but this is already configured
import { loadKeypairSignerFromFile } from 'gill/node'

const { rpc, sendAndConfirmTransaction } = createSolanaClient({ urlOrMoniker: process.env.ANCHOR_PROVIDER_URL! })

describe('journal', () => {
  let payer: KeyPairSigner
  let journal: KeyPairSigner

  beforeAll(async () => {
    journal = await generateKeyPairSigner()
    payer = await loadKeypairSignerFromFile(process.env.ANCHOR_WALLET!)
  })

  it('Initialize Journal', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getInitializeInstruction({ payer: payer, journal: journal })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSER
    const currentJournal = await fetchJournal(rpc, journal.address)
    expect(currentJournal.data.count).toEqual(0)
  })

  it('Increment Journal', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({
      journal: journal.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchJournal(rpc, journal.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Increment Journal Again', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getIncrementInstruction({ journal: journal.address })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchJournal(rpc, journal.address)
    expect(currentCount.data.count).toEqual(2)
  })

  it('Decrement Journal', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getDecrementInstruction({
      journal: journal.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchJournal(rpc, journal.address)
    expect(currentCount.data.count).toEqual(1)
  })

  it('Set journal value', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getSetInstruction({ journal: journal.address, value: 42 })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    const currentCount = await fetchJournal(rpc, journal.address)
    expect(currentCount.data.count).toEqual(42)
  })

  it('Set close the journal account', async () => {
    // ARRANGE
    expect.assertions(1)
    const ix = getCloseInstruction({
      payer: payer,
      journal: journal.address,
    })

    // ACT
    await sendAndConfirm({ ix, payer })

    // ASSERT
    try {
      await fetchJournal(rpc, journal.address)
    } catch (e) {
      if (!isSolanaError(e)) {
        throw new Error(`Unexpected error: ${e}`)
      }
      expect(e.message).toEqual(`Account not found at address: ${journal.address}`)
    }
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
