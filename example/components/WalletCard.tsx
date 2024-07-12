import {
  MAINNET,
  OYL,
  TESTNET,
  UNISAT,
  useLaserEyes,
  XVERSE,
} from '@omnisat/lasereyes'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { satoshisToBTC } from '../../src/lib/helpers'

const WalletCard = ({
  walletName,
  setSignature,
}: {
  walletName: typeof OYL | typeof UNISAT | typeof XVERSE
  setSignature: (signature: string) => void
}) => {
  const {
    connect,
    disconnect,
    provider,
    paymentAddress,
    balance,
    hasUnisat,
    hasOyl,
    hasLeather,
    hasXverse,
    sendBTC,
    signMessage,
    signPsbt,
    network,
    switchNetwork,
  } = useLaserEyes()

  const hasWallet = {
    unisat: hasUnisat,
    oyl: hasOyl,
    leather: hasLeather,
    xverse: hasXverse,
  }

  const connectWallet = async (
    walletName: typeof OYL | typeof UNISAT | typeof XVERSE
  ) => {
    try {
      await connect(walletName)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const send = async () => {
    try {
      if (balance?.total < 1500) {
        throw new Error('Insufficient funds')
      }

      const txid = await sendBTC(paymentAddress, 1500)
      toast.success(
        <span className={'flex flex-col gap-1 items-center justify-center'}>
          <span className={'font-black'}>View on mempool.space</span>
          <a
            target={'_blank'}
            href={`https://mempool.space/tx/${txid}`}
            className={'underline text-blue-600 text-xs'}
          >
            {txid}
          </a>
        </span>
      )
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const sign = async (walletName: string) => {
    try {
      const signature = await signMessage(walletName)
      setSignature(signature)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const switchNet = async (desiredNetwork: typeof MAINNET | typeof TESTNET) => {
    try {
      await switchNetwork(desiredNetwork)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message)
      }
    }
  }

  const unconfirmed = satoshisToBTC(balance?.unconfirmed)
  const confirmed = satoshisToBTC(balance?.confirmed)
  const total = satoshisToBTC(balance?.total)

  return (
    <Card className={'grow'}>
      <CardHeader>
        <CardTitle className={'uppercase text-center'}>{walletName}</CardTitle>
        <CardDescription></CardDescription>
      </CardHeader>
      <CardContent>
        <div className={'flex flex-col gap-4'}>
          <div className={'flex flex-row space-between items-center gap-6'}>
            <Badge variant={provider === walletName ? 'success' : 'secondary'}>
              {provider === walletName ? 'Connected' : 'Disconnected'}
            </Badge>

            <Button
              className={'w-full'}
              disabled={!hasWallet[walletName]}
              variant={provider === walletName ? 'destructive' : 'default'}
              onClick={() =>
                provider === walletName
                  ? disconnect()
                  : connectWallet(walletName)
              }
            >
              {provider === walletName ? 'Disconnect' : 'Connect'}
            </Button>
          </div>

          <div
            className={
              'font-black text-gray-400 italic self-end flex flex-col gap-1 text-right'
            }
          >
            <span>
              {provider !== walletName && unconfirmed ? '--' : unconfirmed}{' '}
              unconfirmed
            </span>
            <span>{provider !== walletName ? '--' : confirmed} confirmed</span>
            <span>{provider !== walletName ? '--' : total} total</span>
          </div>
          <div className={'flex flex-col space-between items-center gap-2'}>
            <Button
              className={'w-full'}
              disabled={!hasWallet[walletName] || provider !== walletName}
              variant={provider !== walletName ? 'secondary' : 'default'}
              onClick={() => (provider !== walletName ? null : send())}
            >
              Send BTC
            </Button>
            <Button
              className={'w-full'}
              disabled={!hasWallet[walletName] || provider !== walletName}
              variant={provider !== walletName ? 'secondary' : 'default'}
              onClick={() =>
                provider !== walletName
                  ? null
                  : sign(walletName).then(console.log)
              }
            >
              Sign Message
            </Button>
            <Button
              className={'w-full'}
              disabled={!hasWallet[walletName] || provider !== walletName}
              variant={provider !== walletName ? 'secondary' : 'default'}
              onClick={() =>
                provider !== walletName ? null : signPsbt(walletName)
              }
            >
              Sign PSBT
            </Button>
            <Button
              className={'w-full'}
              disabled={!hasWallet[walletName] || provider !== walletName}
              variant={provider !== walletName ? 'secondary' : 'default'}
              onClick={() =>
                provider !== walletName
                  ? null
                  : switchNet(network === TESTNET ? MAINNET : TESTNET)
              }
            >
              Switch to {network === TESTNET ? 'Mainnet' : 'Testnet'}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  )
}

export default WalletCard
