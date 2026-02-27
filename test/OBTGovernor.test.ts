import { expect } from "chai";
import { ethers } from "hardhat";

describe("OBTGovernor", () => {
  async function deployGovernanceFixture() {
    const [deployer, voter] = await ethers.getSigners();

    const OBTToken = await ethers.getContractFactory("OBTToken");
    const obt = await OBTToken.deploy(deployer.address);
    await obt.waitForDeployment();

    const OBTGovernor = await ethers.getContractFactory("OBTGovernor");
    const governor = await OBTGovernor.deploy(await obt.getAddress());
    await governor.waitForDeployment();

    // Give voter some tokens and delegate to self for voting power.
    const voterAmount = ethers.parseEther("1000");
    await obt.transfer(voter.address, voterAmount);
    await obt.connect(voter).delegate(voter.address);

    return { deployer, voter, obt, governor };
  }

  it("allows token holders to create, vote on, and execute proposals", async () => {
    const { voter, governor } = await deployGovernanceFixture();

    const targets: string[] = [voter.address];
    const values: bigint[] = [0n];
    const calldatas: string[] = ["0x"]; // no-op call
    const description = "Test proposal: no-op";

    // Compute proposal id using callStatic so we can reference it later.
    const proposalId = await governor.callStatic.propose(
      targets,
      values,
      calldatas,
      description
    );

    await governor.connect(voter).propose(targets, values, calldatas, description);

    // Initially proposal is pending, then becomes active after votingDelay blocks.
    expect(await governor.state(proposalId)).to.equal(0); // Pending

    // Mine one block to move past votingDelay.
    await ethers.provider.send("evm_mine", []);
    expect(await governor.state(proposalId)).to.equal(1); // Active

    // Cast a 'For' vote (support = 1).
    await governor.connect(voter).castVote(proposalId, 1);

    // Mine enough blocks to get past votingPeriod.
    const votingPeriod = await governor.votingPeriod();
    for (let i = 0; i < Number(votingPeriod); i++) {
      await ethers.provider.send("evm_mine", []);
    }

    expect(await governor.state(proposalId)).to.equal(4); // Succeeded

    const descriptionHash = ethers.id(description);
    await governor.execute(targets, values, calldatas, descriptionHash);

    expect(await governor.state(proposalId)).to.equal(7); // Executed
  });
});

