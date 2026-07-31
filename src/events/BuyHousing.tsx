/* eslint-disable react-hooks/immutability */
import {type GameState, Loan} from "../Data.tsx";
import {useState} from "react";
import {ButtonNext, NumberInputAutoSelect} from "../Utils.tsx";

type BuyHousingProps = {
    gameState: GameState;
    avgCost: number;
    type: string;
}

export function BuyHousing({gameState, avgCost, type}: BuyHousingProps) {
    const [used, setUsed] = useState(false);
    const [cash, setCash] = useState(0);

    const cost = avgCost * (used ? .7 : 1);
    const sellValue = gameState.character.houseValue;
    const loan = cost - cash - sellValue;
    return (<div className="flex flex-col gap-4 items-center">
        <div className="flex gap-4">
            <div
                className={"eventButton w-60! panelButton duration-300! " + (used ? "bg-gray-400!" : "bg-gray-200!")}
                onClick={() => setUsed(true)}>
                <p className="text-gray-700">Used</p>
            </div>
            <div
                className={"eventButton w-60! panelButton duration-300! " + (!used ? "bg-gray-400!" : "bg-gray-200!")}
                onClick={() => setUsed(false)}>
                <p className="text-gray-700">New</p>
            </div>
        </div>
        <h3>Cost: {gameState.formatter.format(cost)}</h3>
        {/*<h3>Allocated money: {gameState.formatter.format(allocatedMoney)}</h3>*/}
        {sellValue > 0 ?
            <h3>Sell value of current house: {gameState.formatter.format(sellValue)}</h3>
            : <></>}

        <div className="flex flex-col items-center">
            <div className="w-fit bg-gray-200 rounded-xl p-1 ">
                <p className="text-xl text-gray-700! pl-1">$
                    <NumberInputAutoSelect
                        className="w-40 text-gray-700"
                        min={0}
                        max={gameState.character.savingsAccount.balance}
                        value={cash}
                        onChange={e => {
                            if (isNaN(e.target.valueAsNumber)) {
                                setCash(0);
                                return;
                            }
                            setCash(Math.min(Math.max(e.target.valueAsNumber, 0), Math.ceil(100 * Math.min(gameState.character.savingsAccount.balance, cost - sellValue)) / 100));
                        }}>
                    </NumberInputAutoSelect>
                </p>
            </div>
        </div>
        {loan > 0.001 ?
            <h3>Loan: {gameState.formatter.format(loan)}</h3>
            : <></>}
        <ButtonNext
            style="w-50 text-xl h-10 p-1 font-bold mt-2" text="Buy"
            action={() => {
                gameState.character.satisfaction += (used ? 5 : 7);
                gameState.character.payMoney(Math.min(cash, cost - sellValue - loan));
                gameState.character.housing = type;
                gameState.character.houseValue = cost * (used ? 1 : .7);
                gameState.character.monthlyLivingExpenses.delete("Rent");
                gameState.character.monthlyLivingExpenses.set("House Maintenance", 50);
                gameState.character.monthlyLivingExpenses.set("House Insurance", 180 *  avgCost / 350000 * gameState.inflation);
                if (loan > 0.001)
                    gameState.character.addLoan(
                        new Loan("House Mortgage", loan, gameState.character.savingsAccount, 1.065, true));
            }}/>
    </div>);
}