import React, { Component } from "react";
import Web3 from "web3";
import DaiToken from "../abis/DaiToken.json";
import DappToken from "../abis/DappToken.json";
import TokenFarm from "../abis/TokenFarm.json";
import Navbar from "./Navbar";
import Main from './Main'
import "./App.css";

class App extends Component {
  async componentWillMount() {
    await this.loadWeb3();
    await this.loadBlockchainData();
  }

  async loadBlockchainData() {
    const web3 = window.web3;

    const accounts = await web3.eth.getAccounts();
    this.setState({ account: accounts[0] });
    this.setState({ accounts: accounts });

    const networkId = await web3.eth.net.getId();

    console.log(accounts);
    // Load DAI TOKEN
    const daiTokenData = DaiToken.networks[networkId];
    if (daiTokenData) {
      //Set DAI TOKEN Coontract
      const daiToken = new web3.eth.Contract(
        DaiToken.abi,
        daiTokenData.address
      );
      this.setState({ daiToken: daiToken });

      // Set DAI TOKEN Investor balannce
      let daiTokenBalance = await daiToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ daiTokenBalance: daiTokenBalance.toString() });
      console.log({ balance: daiTokenBalance });
    } else {
      window.alert("DaiToken contract not deployed to detected network");
    }

    // LOAD DappToken
    const dappTokenData = DappToken.networks[networkId];
    if (dappTokenData) {
      //SET Dapp TOKEN CONTRACT
      const dappToken = new web3.eth.Contract(
        DappToken.abi,
        dappTokenData.address
      );
      this.setState({ dappToken: dappToken });

      // SET Dapp TOKEN INVESTOR BALANCE
      let dappTokenBalance = await dappToken.methods
        .balanceOf(this.state.account)
        .call();
      this.setState({ dappTokenBalance: dappTokenBalance.toString() });
      console.log({ balance: dappTokenBalance });
    } else {
      window.alert("DappToken contract not deployed to detected network");
    }

    // LOAD Token Farm
    const tokenFarmData = TokenFarm.networks[networkId]
    if(tokenFarmData) {
        //Load Token Farm
        const tokenFarm = new web3.eth.Contract(TokenFarm.abi, tokenFarmData.address)
        this.setState({tokenFarm: tokenFarm})

        //Check Token Farm Balance 
        let stakingBalance = await tokenFarm.methods.stakingBalance(this.state.account).call()
        this.setState({stakingBalance: stakingBalance.toString()})
    } else {
      window.alert("Token Farm contract not deployed to detected network");
    }

    this.setState({loading: false})
  }

stakeTokens = (amountInWei) => {
    this.setState({loading: true})
    this.state.daiToken.methods.approve(this.state.tokenFarm._address, amountInWei).send({from: this.state.account}).on('transactionHash', (hash) => {
        this.state.tokenFarm.methods.stakeTokens(amountInWei).send({from: this.state.account}).on('transactionHash', (hash) => {
            this.setState({loading: false})
        })
    })
  }

  unstakeTokens = () => {
    this.setState({loading: true})
    this.state.tokenFarm.methods.unstakeTokens().send({from: this.state.account}).on('transactionHash', (hash) => {
        this.setState({loading: false})
    })
  }

  async loadWeb3() {
    if (window.ethereum) {
      window.web3 = new Web3(window.ethereum);
      await window.ethereum.enable();
    } else if (window.web3) {
      window.web3 = new Web3(window.web3.currentProvider);
    } else {
      window.alert(
        "Non-Ethereum browser detected. You should consider trying MetaMask!"
      );
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      account: "0x0",
      accounts: [],
      daiToken: {},
      dappToken: {},
      tokenFarm: {},
      daiTokenBalance: "0",
      dappTokenBalance: "0",
      stakingBalance: "0",
      loading: true,
    };
  }

  render() {
      let content
      if(this.state.loading) {
      content = <p id="loader" className="text-center">Loading...</p>
      } else {
        content = <Main 
        daiTokenBalance={this.state.daiTokenBalance}
        dappTokenBalance={this.state.dappTokenBalance}
        stakingBalance={this.state.stakingBalance}
        stakeTokens={this.stakeTokens}
        unstakeTokens={this.unstakeTokens}
        />

      }
    return (
      <div>
        <Navbar account={this.state.account} />{" "}
        <div className="container-fluid mt-5">
          <div className="row">
            <main
              role="main"
              className="col-lg-12 ml-auto mr-auto"
              style={{ maxWidth: "600px" }}
            >
              <div className="content mr-auto ml-auto">
                <a
                  href="http://www.dappuniversity.com/bootcamp"
                  target="_blank"
                  rel="noopener noreferrer"
                ></a>

{content}
        
              </div>{" "}
            </main>{" "}
          </div>{" "}
        </div>{" "}
      </div>
    );
  }
}

export default App;
