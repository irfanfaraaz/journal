// Here we export some useful types and functions for interacting with the Anchor program.
import { Account, getBase58Decoder, SolanaClient } from 'gill'
import { getProgramAccountsDecoded } from './helpers/get-program-accounts-decoded'
import {
  JournalEntryState,
  JOURNAL_ENTRY_STATE_DISCRIMINATOR,
  JOURNAL_PROGRAM_ADDRESS,
  getJournalEntryStateDecoder,
} from './client/js'
import JournalIDL from '../target/idl/journal.json'

export type JournalAccount = Account<JournalEntryState, string>

// Re-export the generated IDL and type
export { JournalIDL }

export * from './client/js'

export function getJournalProgramAccounts(rpc: SolanaClient['rpc']) {
  return getProgramAccountsDecoded(rpc, {
    decoder: getJournalEntryStateDecoder(),
    filter: getBase58Decoder().decode(JOURNAL_ENTRY_STATE_DISCRIMINATOR),
    programAddress: JOURNAL_PROGRAM_ADDRESS,
  })
}
