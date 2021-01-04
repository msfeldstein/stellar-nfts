import getNFTsForAccount from '../src/getNFTsForAccount'

async function main() {
  // const memo = "V/R9ozI2vFvFiR2iA4NseKT2uQ+nNVI6EU8leSABDOY="

  const NFTs = await getNFTsForAccount("GC3CK3GOQ4FGD7NPFI7J3GONGA477SOUOJFBHUNN3DZTVV4PCF6VHRXU")
  console.log({ NFTs })
}

main()
