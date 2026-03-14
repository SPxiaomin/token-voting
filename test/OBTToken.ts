import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";

describe("OBTToken", async () => {
  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [owner, recipient, voter] = await viem.getWalletClients();

  it("mints the full fixed supply to the initial owner", async () => {
    const obt = await viem.deployContract("OBTToken", [owner.account.address]);

    const totalSupply = await obt.read.totalSupply();
    const ownerBalance = await obt.read.balanceOf([owner.account.address]);

    assert.equal(totalSupply, 1_000_000n * 10n ** 18n);
    assert.equal(ownerBalance, totalSupply);
  });

  it("supports transfers between accounts", async () => {
    const obt = await viem.deployContract("OBTToken", [owner.account.address]);

    const amount = 100n * 10n ** 18n;
    await obt.write.transfer([recipient.account.address, amount], {
      account: owner.account,
    });

    const recipientBalance = await obt.read.balanceOf([
      recipient.account.address,
    ]);
    assert.equal(recipientBalance, amount);
  });

  it("tracks voting power via delegation", async () => {
    const obt = await viem.deployContract("OBTToken", [owner.account.address]);

    const amount = 500n * 10n ** 18n;
    await obt.write.transfer([voter.account.address, amount], {
      account: owner.account,
    });
    await obt.write.delegate([voter.account.address], {
      account: voter.account,
    });

    const currentVotes = await obt.read.getVotes([voter.account.address]);
    assert.equal(currentVotes, amount);
  });
});

