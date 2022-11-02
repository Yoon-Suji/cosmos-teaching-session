import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";

const connectWallet = async(event, chainInfo, {getInfo}) => {
    // 사용자의 브라우저에 Keplr extension이 설치되었는지 확인
    if (!window.getOfflineSigner || !window.keplr) {
        alert("Please install keplr extension");
    }
    if (window.keplr.experimentalSuggestChain) {
        try {
            await window.keplr.experimentalSuggestChain(chainInfo);
        } catch {
            alert("Failed to suggest the chain");
        }
    } else{
        alert("Please use the recent version of keplr extension");
    }

    // Keplr에 해당 chainId로의 접근 요청
    await window.keplr.enable(chainInfo.chainId);
    // 체인 ID를 이용해서 OfflineSigner 가져오기 
    const offlineSigner = window.getOfflineSigner(chainInfo.chainId);
    // address & public key 페어 배열 리턴
    const accounts = await offlineSigner.getAccounts();
    // SigningCosmWasmClient 생성
    const client = await SigningCosmWasmClient.connectWithSigner(chainInfo.rpc, offlineSigner);
    // 해당 주소의 balance 가져오기
    const balance = await client.getBalance(accounts[0].address, chainInfo.stakeCurrency.coinMinimalDenom);
    // <App> 으로 정보 넘겨주기 위한 함수
    getInfo(client, accounts[0].address, balance, chainInfo.chainId);
}

export default connectWallet;