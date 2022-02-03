import * as React from "react";
import { ethers } from "ethers";
import './App.css';
import abi from "./utils/WavePortal.json";
import moment from 'moment';

export default function App() {
  const [currAccount, setCurrentAccount] = React.useState("")
  const [loading, setLoading] = React.useState(true);
  const [waves, setAllWaves] = React.useState([])
  const contractAddress = "0x70aEE8FB44Cb302fb7C4F8418b6336B50c92a9D8"
  const contractABI = abi.abi
  const [currCount, setCurrCount] = React.useState("");


  const checkIfWalletIsConnected = () => {
    const { ethereum } = window;
    if (!ethereum) {
      console.log("Check if you have installed Metamask")
      return
    } else {
      console.log("We have the Ethereum object", ethereum)
    }
    ethereum.request({ method: 'eth_accounts' })
      .then(accounts => {
        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log("Found an authorized account: ", account)
          setCurrentAccount(account);
          setLoading(false)
        } else {
          console.log("No authorized account found")
          setLoading(false)
        }
      })
  }

  const getENSDomainByAddress = async (address) => {
    let name = "";
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        name = await provider.lookupAddress(
          address
        );
      }
    } catch (error) {
      console.log(error);
    }

    return name;
  }

  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();

        const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

        /*
         * Call the getAllWaves method from your Smart Contract
         */
        const waves = await waveportalContract.getAllWaves();


        /*
         * We only need address, timestamp, and message in our UI so let's
         * pick those out
         */
        let wavesCleaned = [];
        for (const wave of waves) {
          const name = await getENSDomainByAddress(wave[0]);
          wavesCleaned.push({
            address: wave[0],
            timestamp: new Date(Math.floor(wave[1]) * 1000),
            name: name

          });
        }


        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
        console.log(waves)
        setLoading(false)
      } else {
        console.log("Ethereum object doesn't exist!")
        setLoading(false)
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    const { ethereum } = window;
    if (!ethereum) {
      alert("Get Metamask")
    }
    ethereum.request({ method: 'eth_requestAccounts' })
      .then(accounts => {
        console.log("Connected", accounts[0])
        setCurrentAccount(accounts[0])
        setLoading(false)
      })
      .catch(err => {
        console.log(err)
        setLoading(false)
      });
    window.location.reload();
  }

  const wave = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves()
    console.log("Retrieved total waves", count.toNumber())

    const waveTxn = await waveportalContract.wave()
    console.log("Mining...", waveTxn.hash)
    await waveTxn.wait()
    console.log("Mined -- ", waveTxn.hash)

    count = await waveportalContract.getTotalWaves()
    console.log("Retrieved total wave count...", count.toNumber())
    setCurrCount(count.toNumber())
    console.log(currCount)
    window.location.reload();
   }

  const initCount = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner()
    const waveportalContract = new ethers.Contract(contractAddress, contractABI, signer);

    let count = await waveportalContract.getTotalWaves()
    console.log("Retrieved total waves", count.toNumber())
    setCurrCount(count.toNumber())
    setLoading(false)
  }

  React.useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    checkIfWalletIsConnected();
    initCount();
    getAllWaves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (loading) {
    return (<div className="mainContainer">
      Loading..
    </div>)
  }
  return (
    <div className="mainContainer">

      <div className="dataContainer">
        <div className="header">
          👋 Hello there!
        </div>

        <div className="bio">
          Already {currCount} people waved!
        </div>
        <button className="waveButton" onClick={wave}>
          Wave at Me
        </button>
        {currAccount ? null : (
          <button className="wavebutton" onClick={connectWallet}>Connect Wallet then refresh page to view count
          </button>
        )}
        <div className="bio">
        </div>
      </div>

      <div className="waveContainer bio">
        <h3>Latest waves</h3>
        {waves.slice(Math.max(waves.length - 5, 0)).map(wave => {
          if (!wave.name) {
            return <><span title={wave.address}>👋 {wave.address.substr(0, 20) + "\u2026"} at {moment(wave.timestamp).format('MMMM Do YYYY, h:mm:ss a')} <b>Kudos!</b></span><hr /></>;
          } else {
            return <><span>👋 {wave.name} at {moment(wave.timestamp).format('MMMM Do YYYY, h:mm:ss a')} <b>Kudos!</b></span><hr /></>
          }
        })}
      </div>
      <div className="twitterContainer">

        <a href="https://twitter.com/frankanka?ref_src=twsrc%5Etfw" className="twitter-follow-button" data-show-count="false">Follow @frankanka</a><script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>
      </div>
    </div>
  );
}