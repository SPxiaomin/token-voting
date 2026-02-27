import { ethers } from "hardhat";

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with account:", deployer.address);

  // Deploy OBT token with full supply to deployer (or a treasury in the future).
  const OBTToken = await ethers.getContractFactory("OBTToken");
  const obtToken = await OBTToken.deploy(deployer.address);
  await obtToken.waitForDeployment();

  const obtTokenAddress = await obtToken.getAddress();
  console.log("OBTToken deployed to:", obtTokenAddress);

  // Deploy Governor using OBT as the voting token.
  const OBTGovernor = await ethers.getContractFactory("OBTGovernor");
  const governor = await OBTGovernor.deploy(obtTokenAddress);
  await governor.waitForDeployment();

  const governorAddress = await governor.getAddress();
  console.log("OBTGovernor deployed to:", governorAddress);

  // Optional: self-delegate deployer's tokens so they can propose and vote.
  const delegateTx = await obtToken.delegate(deployer.address);
  await delegateTx.wait();
  console.log("Delegated OBT voting power to deployer");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

