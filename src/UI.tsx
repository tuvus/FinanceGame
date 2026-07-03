import {useEffect, useState} from "react";
import {GameState} from "./Data.tsx";

type NumberAnimationProps = {
    gameState: GameState; amount: number;
}

export function BalanceNumber({gameState, amount}: NumberAnimationProps) {
    const [previousBalance, setPreviousBalance] = useState(amount);
    const [targetBalance, setTargetBalance] = useState(amount)
    const [increaseAnimationState, setIncreaseAnimationState] = useState(amount);
    const [displayedBalance, setDisplayedBalance] = useState(amount)
    useEffect(() => {
        const interval = setInterval(() => {
            if (increaseAnimationState != -1) {
                setDisplayedBalance(previousBalance + (amount - previousBalance) * (increaseAnimationState + 1) / 14);
                if (increaseAnimationState + 1 >= 14) {
                    setPreviousBalance(amount);
                    setIncreaseAnimationState(-1);
                } else {
                    setIncreaseAnimationState(() => increaseAnimationState + 1);
                }
            }
            if (amount != targetBalance) {
                setIncreaseAnimationState(0);
                setTargetBalance(amount);
            }

        }, 100);
        return () => clearTimeout(interval);
    }, [amount, previousBalance, increaseAnimationState]);
    return (
        <h2 className="text-gray-700! justify-self-end mt-2 h-9" id="balancetext">
            {gameState.formatter.format(displayedBalance)}
            {increaseAnimationState >= 0 ?
                (amount - previousBalance > 0 ?
                        <div><h2 className="relative text-green-400! left-0 bottom-22"
                        >+{gameState.formatter.format(amount - previousBalance)}</h2></div>
                        : <div><h2 className="relative text-red-400! left-0 bottom-22"
                        >{gameState.formatter.format(amount - previousBalance)}</h2></div>
                ) : <></>}</h2>);
}

export function SatisfactionNumber({amount}: NumberAnimationProps) {
    const [previousSatisfaction, setPreviousSatisfaction] = useState(amount);
    const [targetSatisfaction, setTargetSatisfaction] = useState(amount)
    const [increaseAnimationState, setIncreaseAnimationState] = useState(amount);
    const [displayedSatisfaction, setDisplayedSatisfaction] = useState(amount)
    useEffect(() => {
        const interval = setInterval(() => {
            if (increaseAnimationState != -1) {
                setDisplayedSatisfaction(previousSatisfaction + (amount - previousSatisfaction) * (increaseAnimationState + 1) / 14);
                if (increaseAnimationState + 1 >= 14) {
                    setPreviousSatisfaction(amount);
                    setIncreaseAnimationState(-1);
                } else {
                    setIncreaseAnimationState(() => increaseAnimationState + 1);
                }
            }
            if (amount != targetSatisfaction) {
                setIncreaseAnimationState(0);
                setTargetSatisfaction(amount);
            }

        }, 100);
        return () => clearTimeout(interval);
    }, [amount, previousSatisfaction, increaseAnimationState]);
    return (
        <div className="fixed right-1 p-2 rounded-2xl justify-end bg-amber-100 h-16 mt-1">
            <h2 className="text-gray-700! pt-1 pl-2 pr-2">Satisfaction: {Math.floor(displayedSatisfaction)}</h2>
            {
                increaseAnimationState >= 0 ?
                    (amount - previousSatisfaction > 0 ?
                            <div>
                                <h2 className="relative text-green-400! left-0 top-2"
                                >+{Math.floor(amount - previousSatisfaction)}</h2>
                            </div>
                            : <div><h2 className="relative text-red-400! left-0 top-2"
                            >{Math.floor(amount - previousSatisfaction)}</h2></div>
                    ) : <></>
            }</div>)
        ;
}