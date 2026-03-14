import { network } from "hardhat";

async function main() {
  const { viem } = await network.connect();
  const [deployer] = await viem.getWalletClients();

  console.log("Deploying contracts with account:", deployer.account.address);

  // Deploy OBT token with full supply to deployer (or a treasury in the future).
  const obtToken = await viem.deployContract("OBTToken", [
    deployer.account.address,
  ]);
  console.log("OBTToken deployed to:", obtToken.address);

  // Deploy Governor using OBT as the voting token.
  const governor = await viem.deployContract("OBTGovernor", [obtToken.address]);
  console.log("OBTGovernor deployed to:", governor.address);

  // Optional: self-delegate deployer's tokens so they can propose and vote.
  await obtToken.write.delegate([deployer.account.address], {
    account: deployer.account,
  });
  console.log("Delegated OBT voting power to deployer");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

