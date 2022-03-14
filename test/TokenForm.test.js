const DaiToken = artifacts.require('daiToken')
const DappToken = artifacts.require('dappToken')
const TokenFarm = artifacts.require('TokenFarm')

require('chai')
    .use(require('chai-as-promised'))
    .should()

function tokens(n) {
    return web3.utils.toWei(n, "ether")
}

contract("TokenFarm", ([owner, investor]) => {

    let daiToken, dappToken, tokenFarm

    before(async() => {
        //Load Contract
        daiToken = await DaiToken.new()
        dappToken = await DappToken.new()
        tokenFarm = await TokenFarm.new(dappToken.address, daiToken.address)

        //Transfer all Dapp Token  to Token Farm Contract
        await dappToken.transfer(tokenFarm.address, web3.utils.toWei('1000000', "Ether"))


        //Tranfer 100 Dai Token to investor
        await daiToken.transfer(investor, tokens("100"), { "from": owner })

    })
    describe('Mock Dai Deployment', async() => {
        it('has a name', async() => {
            const name = await daiToken.name()
            assert.equal(name, 'Mock DAI Token')
        })
    })

    describe('Mock Dapp Deployment', async() => {
        it('has a name ', async() => {
            const name = await dappToken.name()
            assert.equal(name, "DApp Token")
        })
    })

    describe('Mock Token Farm Deployment', async() => {
        it('has a name ', async() => {
            const name = await tokenFarm.name()
            assert.equal(name, "Dapp Token Farm")
        })

        it('has all dApp Token transferred', async() => {
            let totalSupplyDappToken = await dappToken.totalSupply()
            let balanceInFarm = await dappToken.balanceOf(tokenFarm.address)
            assert.equal(totalSupplyDappToken.toString(), balanceInFarm.toString())

        })

        it('has staked Token', async() => {
            await daiToken.approve(tokenFarm.address, tokens('100'), { "from": investor })
            await tokenFarm.stakeTokens(web3.utils.toWei('100', 'ether'), { "from": investor })

            tokenfarmBalanceDai = await daiToken.balanceOf(tokenFarm.address)

            // Staking Dai Token
            assert.equal(tokenfarmBalanceDai.toString(),
                web3.utils.toWei('100', 'ether').toString(),
                "Dai Token Stacked error")

            result = await tokenFarm.stakingBalance(investor)
            assert.equal(result.toString(), web3.utils.toWei('100', 'ether').toString(), 'investor staking balance correct after staking')

            result = await daiToken.balanceOf(investor)
            assert.equal(result.toString(), web3.utils.toWei("0", "ether").toString(), 'investor Mock DAI wallet balance correct before staking')

            result = await daiToken.balanceOf(tokenFarm.address)
            assert.equal(result.toString(), tokens('100'), 'Token Farm Mock DAI balance correct after staking')

            result = await tokenFarm.isStaking(investor)
            assert.equal(result.toString(), 'true', 'investor staking status correct after staking')
        })



        it('has Issued Token', async() => {

            console.log("DDDDDAAAAAIIIII ==> " + await daiToken.balanceOf(investor))
            console.log("DDDDDAAAAAIIIII ==> " + web3.utils.toWei('100', 'ether'))

            // Reject if non  owner try to call issueToken
            await tokenFarm.issueTokens({ "from": investor }).should.be.rejected;

            //  Check if the owner issue Token
            await tokenFarm.issueTokens({ "from": owner })
            dappTokenIssued = await dappToken.balanceOf(investor)
            stakingBalance = await tokenFarm.stakingBalance(investor)
            assert.equal(dappTokenIssued.toString(), stakingBalance.toString(), "test Has Issued Token")
        })

        it('Has unstaked tokens', async() => {
            await tokenFarm.unstakeTokens({ "from": investor })
            balance = await tokenFarm.stakingBalance(investor)

            assert.equal(balance, web3.utils.toWei("0", "ether").toString(), "Has unstaked tokens")

            result = await tokenFarm.isStaking(investor)
            assert.equal(result, false, "Has unstaked tokens test 2")
        })


    })



})