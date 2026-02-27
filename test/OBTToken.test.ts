import { expect } from "chai";
import { ethers } from "hardhat";

describe("OBTToken", () => {
  it("mints the full fixed supply to the initial owner", async () => {
    const [owner] = await ethers.getSigners();

    const OBTToken = await ethers.getContractFactory("OBTToken");
    const obt = await OBTToken.deploy(owner.address);
    await obt.waitForDeployment();

    const totalSupply = await obt.totalSupply();
    const ownerBalance = await obt.balanceOf(owner.address);

    expect(totalSupply).to.equal(ethers.parseEther("1000000"));
    expect(ownerBalance).to.equal(totalSupply);
  });

  it("supports transfers between accounts", async () => {
    const [owner, recipient] = await ethers.getSigners();

    const OBTToken = await ethers.getContractFactory("OBTToken");
    const obt = await OBTToken.deploy(owner.address);
    await obt.waitForDeployment();

    const amount = ethers.parseEther("100");
    await expect(obt.transfer(recipient.address, amount))
      .to.emit(obt, "Transfer")
      .withArgs(owner.address, recipient.address, amount);

    expect(await obt.balanceOf(recipient.address)).to.equal(amount);
  });

  it("tracks voting power via delegation", async () => {
    const [owner, voter] = await ethers.getSigners();

    const OBTToken = await ethers.getContractFactory("OBTToken");
    const obt = await OBTToken.deploy(owner.address);
    await obt.waitForDeployment();

    // Transfer tokens to voter and delegate to self.
    const amount = ethers.parseEther("500");
    await obt.transfer(voter.address, amount);
    await obt.connect(voter).delegate(voter.address);

    // After delegation, current voting power should equal delegated balance.
    const currentVotes = await obt.getVotes(voter.address);
    expect(currentVotes).to.equal(amount);
  });
});

