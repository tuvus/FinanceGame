import {useEffect, useState} from "react";
import {GameState} from "./Data.tsx";

type BalanceNumberProps = {
    gameState: GameState; balance: number;
}

function BalanceNumber({gameState, balance}: BalanceNumberProps) {
    const [previousBalance, setPreviousBalance] = useState(balance);
    const [increaseAnimationState, setIncreaseAnimationState] = useState(balance);
    const [displayedBalance, setDisplayedBalance] = useState(balance)
    useEffect(() => {
        const interval = setInterval(() => {
            if (increaseAnimationState != -1) {
                setDisplayedBalance(previousBalance + (balance - previousBalance) * (increaseAnimationState + 1) / 14);
                if (increaseAnimationState + 1 >= 14) {
                    setPreviousBalance(balance);
                    setIncreaseAnimationState(-1);
                } else {
                    setIncreaseAnimationState(() => increaseAnimationState + 1);
                }
            } else if (balance != previousBalance) {
                setIncreaseAnimationState(0);
            }

        }, 100);
        return () => clearTimeout(interval);
    }, [balance, previousBalance, increaseAnimationState]);
    return (
        <h2 className="text-gray-700! justify-self-end mt-2">{gameState.formatter.format(displayedBalance)}</h2>
    );
}

export default BalanceNumber;