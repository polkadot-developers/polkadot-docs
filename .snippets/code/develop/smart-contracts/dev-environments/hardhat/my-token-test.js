const { expect } = require("chai")
const { ethers } = require("hardhat")

describe("MyToken", function () {
    let token, owner, addr1, addr2
    const initialSupply = ethers.parseUnits("1000000", 18) // 1M tokens

    beforeEach(async () => {
        ;[owner, addr1, addr2] = await ethers.getSigners()

        const MyToken = await ethers.getContractFactory("MyToken")
        token = await MyToken.deploy(initialSupply)
        await token.waitForDeployment()
    })

    it("should assign the initial supply to the deployer", async () => {
        const balance = await token.balanceOf(owner.address)
        expect(balance).to.equal(initialSupply)
    })

    it("should allow minting by MINTER_ROLE", async () => {
        const amount = ethers.parseUnits("1000", 18)
        await token.mint(addr1.address, amount)
        expect(await token.balanceOf(addr1.address)).to.equal(amount)
    })

    it("should not allow minting by non-minters", async () => {
        const amount = ethers.parseUnits("1000", 18)
        await expect(token.connect(addr1).mint(addr2.address, amount))
            .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, await token.MINTER_ROLE())
    })

    it("should allow burning tokens", async () => {
        const burnAmount = ethers.parseUnits("500", 18)
        await token.burn(burnAmount)
        const balance = await token.balanceOf(owner.address)
        expect(balance).to.equal(initialSupply - burnAmount)
    })

    it("should allow pausing by PAUSER_ROLE", async () => {
        await token.pause()
        await expect(token.transfer(addr1.address, 1)).to.be.revertedWithCustomError(
            token,
            "EnforcedPause",
        )
    })

    it("should not allow pausing by non-pauser", async () => {
        const PAUSER_ROLE = await token.PAUSER_ROLE()

        await expect(token.connect(addr1).pause())
            .to.be.revertedWithCustomError(token, "AccessControlUnauthorizedAccount")
            .withArgs(addr1.address, PAUSER_ROLE)
    })

    it("should allow unpausing", async () => {
        await token.pause()
        await token.unpause()
        await expect(token.transfer(addr1.address, 100)).to.not.be.reverted
    })

    it("should assign roles correctly", async () => {
        const MINTER_ROLE = await token.MINTER_ROLE()
        const PAUSER_ROLE = await token.PAUSER_ROLE()
        expect(await token.hasRole(MINTER_ROLE, owner.address)).to.be.true
        expect(await token.hasRole(PAUSER_ROLE, owner.address)).to.be.true
    })
})
