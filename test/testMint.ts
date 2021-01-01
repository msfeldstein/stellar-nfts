import fs from 'fs'
import mint from "../src/mint"
import dotenv from 'dotenv'
dotenv.config()

async function main() {
  const file = fs.readFileSync('./test/assets/gravity.jpg')
  if (!process.env.MINTING_ACCOUNT_SECRET) throw "Add MINTING_ACCOUNT_SECRET to .env file"
  const nft = await mint(file, process.env.MINTING_ACCOUNT_SECRET)
  console.log("Minted", nft)
}

main()
