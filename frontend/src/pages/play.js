import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SigningCosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import reset from "../contract/reset";
import get_count from "../contract/get_count";
import networkInfo from "../wallet/network_info";
import increment from "../contract/increment";

const Play = () => {
    // 플레이 시간
    const playTime = 15;
    // 플레이 시간
    const [time, setTime] = useState(playTime);
    // 게임 오버 여부
    const [gameOver, setGameOver] = useState(false);
    // 게임 시작 여부
    const [gameStart, setGameStart] = useState(false);
    // 아이콘의 위치 정보
    const [targetPosition, setTargetPosition] = useState({
        top: "20%",
        left: "50%",
      });
    // 로딩 중인지 여부
    const [loading, setLoading] = useState(false);
    // 현재 점수
    const [score, setScore] = useState(0);
    // 컨트랙트에 저장된 이전 점수
    const [previousScore, setPreviousScore] = useState(0);
    // client
    const [client, setClient] = useState();
    // setInterval이 리턴하는 timerId 값 저장
    const [timerId, setTimerId] = useState();
    const location = useLocation();
        
    // 페이지가 렌더링될 때 client 를 생성해서 저장
    useEffect(() => {
        const getClient = async (chainId) => {
            // Keplr에 해당 chainId로의 접근 요청
            await window.keplr.enable(chainId);
            // 체인 ID를 이용해서 OfflineSigner 가져오기 
            const offlineSigner = window.getOfflineSigner(chainId);
            // SigningCosmWasmClient 생성
            const client = await SigningCosmWasmClient.connectWithSigner(
                networkInfo[chainId].rpc,
                offlineSigner
            );
            setClient(client);
            };
        getClient(location.state.chainId);
    }, []);

    // time이 변하는 것을 감지하여 0이 될때 게임 종료
    useEffect(() => {
        if (time === 0) {
        // 아이콘이 보이지 않도록 설정
        setTargetPosition({ display: "none" });
        // 게임 종료 알람창
        alert(
            `Game Over! Your score is ${score}. Please confirm transaction to submit score.`
        );
        // setInterval 함수 중지
        clearInterval(timerId);
        setGameOver(true);
        setGameStart(false);
        }
    }, [time]);

    // Game Start 버튼 눌렀을 때 실행
    const startGame = async(event) => {
        // 컨트랙트와 통신하는 동안 loading 상태를 true로 설정
        setLoading(true);
        // get_count 쿼리 실행
        const result = await get_count(client, location.state.chainId);
        // preiousScore에 읽어온 count 값 저장
        setPreviousScore(result.count);
        // reset 트랜잭션 실행해서 컨트랙트의 count 값을 0으로 초기화
        await reset(client, location.state.address, 0, location.state.chainId, location.state.denom);
        // 컨트랙트와 통신이 끝난 후 loading 상태를 false로 설정
        setLoading(false);
        // gameStart 를 true로 설정하여 게임 시작하기
        setGameStart(true);
        // 아이콘이 나타나도록 위치 설정
        setTargetPosition({ top: "20%", left: "50%" });
        // setInterval 메소드를 이용해 1초마다 time이 1씩 줄어들도록 설정
        setTimerId(
            setInterval(() => {
                setTime((time) => (time > 0 ? time - 1 : 0));
            }, 1000)
        );
    }

    // Transaction 버튼을 눌렀을 때 실행
    const submitScore = async(event) => {
        // 컨트랙트와 통신하는 동안 loading 상태를 true로 설정
        setLoading(true);
        // 사용자가 얻은 점수(score) 만큼 increment 트랜잭션 실행해서 컨트랙트의 count 값을 score로 바꾸기
        await increment(client, location.state.address, score, location.state.chainId, location.state.denom);
        // 현재 점수 0으로 초기화
        setScore(0);
        // get_count 쿼리를 통해 컨트랙트에 저장된 count 값을 읽어와서 Previous Score에 업데이트
        const result = await get_count(client, location.state.chainId);
        setPreviousScore(result.count);
        // 컨트랙트와 통신이 끝난 후 loading 상태를 false로 설정
        setLoading(false);
        // 게임을 다시 시작할 수 있도록 설정
        setGameOver(false);
        setTime(playTime);
    };

    // 게임이 시작되기 전에는 GAME START , 게임 오버된 후에는 TRANSACTION 버튼 보이도록
    const renderButton = () => {
        if (gameOver === false) {
            return (
                <button className="game-btn" onClick={(event) => startGame(event)}>
                GAME START
                </button>
            );
        } else {
            return (
                <button className="game-btn" onClick={(event) => submitScore(event)}>
                TRANSACTION
                </button>
            );
        }
    };

    // CosmWasm 아이콘을 클릭했을 때 실행되는 함수
    const handleClick = () => {
        // 현재 점수가 +1 씩 증가
        setScore((score) => score + 1);
        // 아이콘의 다음 위치를 랜덤으로 설정
        setTargetPosition({
        top: `${Math.floor(Math.random() * 80 + 10)}%`,
        left: `${Math.floor(Math.random() * 80) + 10}%`,
        });
    };

    return (
        <div className="score-board-container">
          <div className="play-container">
            <div className="score-menu">
              <span>Previous Score: {previousScore}</span>
              <span>Current Score: {score}</span>
            </div>
            {renderButton()}
            <span>Time left: {time} s</span>
          </div>
    
          <div className="game-container">
            <img src="/Background.svg" alt="background" id="background"></img>
            {gameStart && (
              <img
                src="/cosmwasm-mark.svg"
                alt="Target"
                id="target"
                style={{ position: "absolute", ...targetPosition }}
                onClick={handleClick}
              />
            )}
            {loading && <div className="loading-msg">Loading...</div>}
          </div>
        </div>
    );
}

export default Play;