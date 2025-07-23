import { Binary, createClient } from "polkadot-api"
import { getSmProvider } from "polkadot-api/sm-provider"
import { start } from "polkadot-api/smoldot"
import { chainSpec as dotChainSpec } from "polkadot-api/chains/polkadot"
import { dot } from "@polkadot-api/descriptors"
 
/// Start smoldot and setup the chain
const smoldot = start()
const dotChain = smoldot.addChain({ chainSpec: dotChainSpec })
 
/// Create the client and their typedApi
console.log("Initializing…")
const dotClient = createClient(getSmProvider(dotChain))
const dotApi = dotClient.getTypedApi(dot)
 
// Optionally, wait until we have received the initial block for the chain
await Promise.all([dotApi.compatibilityToken])
 
// to complete the example, let's check the balance of one account.
const ADDRESS = "16JGzEsi8gcySKjpmxHVrkLTHdFHodRepEz8n244gNZpr9J"
const DECIMALS = 10
 
console.log("Fetching info…")
const [account] = await Promise.all([
  dotApi.query.System.Account.getValue(ADDRESS),
])
 
const freeBalance = Number(account.data.free) / Math.pow(10, DECIMALS)
 
console.log(`${ADDRESS}'s balance is ${freeBalance.toLocaleString()} DOT`)
 
// To have the process exit cleanly, we can now close our connection and terminate smoldot.
dotClient.destroy()
await smoldot.terminate()
 
process.exit(0)