const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Lock', function () {
  let owner, otherAccount;

  beforeEach(async function () {
    [owner, otherAccount] = await ethers.getSigners();
  });

  const FAR_FUTURE_TIME = 10 ** 13;
  const ONE_GWEI = 1_000_000_000;

  it('Should deploy successfully with future unlock time', async function () {
    // Deploy with a timestamp far in the future
    const Lock = await ethers.getContractFactory('Lock');
    const lock = await Lock.deploy(FAR_FUTURE_TIME, { value: ONE_GWEI });

    // Verify the contract was deployed successfully
    expect(await lock.unlockTime()).to.equal(FAR_FUTURE_TIME);
    expect(await lock.owner()).to.equal(owner.address);
    expect(await ethers.provider.getBalance(lock.target)).to.equal(ONE_GWEI);
  });

  it('Should fail if unlock time is not in the future', async function () {
    // Use a timestamp in the past
    const PAST_TIME = Math.floor(Date.now() / 1000) - 1000;

    const Lock = await ethers.getContractFactory('Lock');

    // This should be reverted due to the past timestamp
    await expect(
      Lock.deploy(PAST_TIME, { value: ONE_GWEI })
    ).to.be.revertedWith('Unlock time should be in the future');
  });

  it('Should not allow non-owners to withdraw', async function () {
    // Deploy with a future timestamp
    const Lock = await ethers.getContractFactory('Lock');
    const lock = await Lock.deploy(FAR_FUTURE_TIME, { value: ONE_GWEI });

    // Try to withdraw as non-owner
    await expect(lock.connect(otherAccount).withdraw()).to.be.revertedWith(
      "You can't withdraw yet"
    );
  });
});
