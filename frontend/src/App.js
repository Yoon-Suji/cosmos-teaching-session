import './App.css';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import networkInfo from './wallet/network_info';
import connectWallet from './wallet/connect';
import { calculateFee, GasPrice } from "@cosmjs/stargate";

function App() {
  // connectWallet에서 받아올 값
  const [client, setClient] = useState();
  const [address, setAddress] = useState();
  const [balance, setBalance] = useState();
  const [chainId, setChainId] = useState();
  // PLAY 버튼의 visibility 속성을 위한 변수
  const [visible, setVisible] = useState("hidden");
  const navigate = useNavigate();
  // const fs = require("fs");
  const [isUpload, setIsUpload] = useState(false);
  const [wasm, setWasm] = useState();

  // connectWallet 으로 전달할 함수
  const getInfo = (client, address, balance, chainId) => {
    setClient(client);
    setAddress(address);
    setBalance(balance);
    setChainId(chainId);
    setVisible("visible");
  }

  // connectWallet으로 가져온 정보를 초기화
  const disconnect = (event) => {
    setClient();
    setChainId();
    setAddress();
    setBalance();
    setVisible("hidden");
  }

  const uploadContract = async() => {
    if (client) {
      // const wasm = ...
      const gasPrice = GasPrice.fromString("0.025" + balance.denom);
      const uploadFee = calculateFee(300_000, gasPrice);
      const receipt = await client.upload(address, wasm, uploadFee);
      console.log(receipt);
      setIsUpload(true);
    }
  }

  // 네트워크 별로 chainId에 따라서 DISCONNECT와 CONNECT 버튼이 나타나도록 구현
  const renderBtn = () => {
    return Object.keys(networkInfo).map((id) => {
      if (chainId === id) {
        return (
          <button type='button' onClick={event => disconnect(event)} className='disconnect-btn'>DISCONNECT</button>
        )
      }
      return (
        <button type='button' onClick={event => connectWallet(event, networkInfo[id], {getInfo})} className='connect-btn'> Connect Wallet (Osmosis Testnet) </button>
      )
    })
  }

  // 지갑과 연결되어 있으면 address와 balance 정보 출력
  const showWalletInfo = () => {
    if (client) {
      return (
        <div className='wallet-info'>
          <p>{`address: ${address}`}</p>
          <p>{`balance: ${balance.amount} ${balance.denom}`}</p>
        </div>
      )
    }
  }

  // PLAY 버튼 클릭하면 /play 주소로 이동
  const playGame = () => {
    return (
      <div className="menu">
        {/* <label for="fname">First Name</label>
        <input type="text" id="fname" name="firstname" placeholder="Your name.."></input> */}
        <button
          className="play-btn"
          onClick={
            async() => await uploadContract()
          } style={{visibility: visible}}
        >
          <span>Deploy contract</span>
        </button>
        {!client && (<p>Ewhachain Cosmos teaching session</p>)}
      </div>
    );
  };

  return (
    <div className="App">
      <header>
        <div className='header-titles'>
          <h1>CosmWasm Teaching dApp</h1>
        </div>
      </header>
      <div className='App-container'>
        <div className='App-menu-container'>
          {playGame()}
          <div className='connect-wallet'>
            {renderBtn()}
          </div>
        </div>
        {showWalletInfo()}
      </div>
    </div>
  );
}

export default App;
