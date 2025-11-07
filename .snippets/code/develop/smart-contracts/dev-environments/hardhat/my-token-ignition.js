// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules")

const MyTokenModule = buildModule("MyTokenModule", (m) => {
    const initialSupply = m.getParameter("initialSupply", 1000000n * 10n ** 18n)

    const token = m.contract("MyToken", [initialSupply])

    return { token }
})

module.exports = MyTokenModule
