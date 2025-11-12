import { Address } from 'gill'
import { useGetBalanceQuery } from '../data-access/use-get-balance-query'
import { AccountUiBalanceSol } from './account-ui-balance-sol'

export function AccountUiBalance({ address }: { address: Address }) {
  const query = useGetBalanceQuery({ address })

  const handleRefetch = () => query.refetch()

  return (
    <h1
      className="text-5xl font-bold cursor-pointer"
      onClick={handleRefetch}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleRefetch()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label="Refresh balance"
    >
      {query.data?.value ? <AccountUiBalanceSol balance={query.data?.value} /> : '...'} SOL
    </h1>
  )
}
