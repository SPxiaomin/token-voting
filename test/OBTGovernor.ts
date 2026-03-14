import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, stringToHex } from "viem";

describe("OBTGovernor", async () => {
  const { viem, networkHelpers } = await network.connect();
  const [deployer, voter] = await viem.getWalletClients();

  async function deployGovernanceFixture() {
    const obt = await viem.deployContract("OBTToken", [
      deployer.account.address,
    ]);
    const governor = await viem.deployContract("OBTGovernor", [obt.address]);

    const voterAmount = 1_000_000n * 10n ** 18n;
    await obt.write.transfer([voter.account.address, voterAmount], {
      account: deployer.account,
    });
    await obt.write.delegate([voter.account.address], {
      account: voter.account,
    });

    return { obt, governor, voter };
  }

  it("allows token holders to create, vote on, and execute proposals", async () => {
    const { voter, governor } = await deployGovernanceFixture();

    const targets: `0x${string}`[] = [voter.account.address];
    const values: bigint[] = [0n];
    const calldatas: `0x${string}`[] = ["0x"];
    const description = "Test proposal: no-op";

    const descriptionHash = keccak256(stringToHex(description));
    const proposalId = await governor.read.hashProposal([
      targets,
      values,
      calldatas,
      descriptionHash,
    ]);

    await governor.write.propose(
      [targets, values, calldatas, description],
      { account: voter.account },
    );

    const statePending = await governor.read.state([proposalId]);
    assert.equal(statePending, 0);

    await networkHelpers.mine(2);
    const stateActive = await governor.read.state([proposalId]);
    assert.equal(stateActive, 1);

    await governor.write.castVote([proposalId, 1], {
      account: voter.account,
    });

    const votingPeriod = (await governor.read.votingPeriod()) as bigint;
    await networkHelpers.mine(votingPeriod);

    const stateSucceeded = await governor.read.state([proposalId]);
    assert.equal(stateSucceeded, 4);

    await governor.write.execute(
      [targets, values, calldatas, descriptionHash],
      { account: voter.account },
    );

    const stateExecuted = await governor.read.state([proposalId]);
    assert.equal(stateExecuted, 7);
  });
});

