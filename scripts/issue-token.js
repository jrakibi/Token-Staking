const TokenFarm = artifacts.require("TokenFarm");
const DappToken = artifacts.require("DappToken");
const DaiToken = artifacts.require("DaiToken");

module.exports = async function(callback, accounts) {

    let tokenFarm = await TokenFarm.deployed()
    console.log(`${tokenFarm.address}`)

    await tokenFarm.issueTokens()
    console.log("dsdß")

    callback()
};