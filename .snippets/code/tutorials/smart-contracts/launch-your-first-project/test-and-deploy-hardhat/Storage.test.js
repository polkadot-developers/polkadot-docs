const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Storage', function () {
  let storage;
  let owner;
  let addr1;

  beforeEach(async function () {
    // Get signers
    [owner, addr1] = await ethers.getSigners();

    // Deploy the Storage contract
    const Storage = await ethers.getContractFactory('Storage');
    storage = await Storage.deploy();
    await storage.waitForDeployment();
  });

  describe('Basic functionality', function () {
    it('Should return 0 initially', async function () {
      expect(await storage.retrieve()).to.equal(0);
    });

    it('Should update when store is called', async function () {
      const testValue = 42;
      // Store a value
      await storage.store(testValue);
      // Check if the value was updated
      expect(await storage.retrieve()).to.equal(testValue);
    });

    it('Should emit an event when storing a value', async function () {
      const testValue = 100;
      // Check if the NumberChanged event is emitted with the correct value
      await expect(storage.store(testValue))
        .to.emit(storage, 'NumberChanged')
        .withArgs(testValue);
    });

    it('Should allow storing sequentially increasing values', async function () {
      const values = [10, 20, 30, 40];

      for (const value of values) {
        await storage.store(value);
        expect(await storage.retrieve()).to.equal(value);
      }
    });
  });
});
