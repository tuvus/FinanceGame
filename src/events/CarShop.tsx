/* eslint-disable react-hooks/immutability */
import {GameState, Loan} from "../Data.tsx";
import {Car, Goal} from "../Character.tsx";
import {useState} from "react";
import {ButtonNext, NumberInputAutoSelect} from "../Utils.tsx";
import {electricCarModels, electricLuxuryCarModels, gasCarModels, gasLuxuryCarModels} from "../Constants.tsx";
import random from "random";

export type CarShopProps = {
    gameState: GameState;
    action: (gameState: GameState) => void;
    allocatedMoney: number;
    garage: number;
}

export function CarShop({gameState, action, allocatedMoney, garage}: CarShopProps) {
    const addCarGoal = (buyDate: Date) => {
        const targetDate = new Date(gameState.character.cars[garage].getAvgExpirationDate().toString());
        gameState.character.checkGoalOfName(gameState, "Buy a new car");
        gameState.character.addGoal(new Goal("Buy a new car",
            "Your current car isn't going to last forever, you should plan to buy a new one within one year of " + targetDate.getFullYear(),
            gameState.character.cars[garage].getAvgExpirationDate(),
            (gameState) => gameState.character.cars[garage].buyDate.getFullYear() > buyDate.getFullYear(),
            (gameState) => {
                gameState.character.satisfaction += 2;
                action(gameState);
            }));
    }
    const [used, setUsed] = useState(false);
    const [ev, setEv] = useState(false);
    const [extravagant, setExtravagant] = useState(false);
    const [cash, setCash] = useState(0);
    const [model, setModel] = useState(gasCarModels[random.int(0, gasCarModels.length - 1)]);
    const refreshModel = () => {
        setModel(ev ? (extravagant ?
            electricLuxuryCarModels[random.int(0, electricLuxuryCarModels.length - 1)]
            : electricCarModels[random.int(0, electricCarModels.length - 1)]) : (extravagant ?
            gasLuxuryCarModels[random.int(0, gasLuxuryCarModels.length - 1)] :
            gasCarModels[random.int(0, gasCarModels.length - 1)]));
    };

    let cost = 50000 * gameState.inflation;
    let gpm = 30;
    let monthlyInsurance = 180
    if (used) {
        cost /= 2;
        gpm *= .9;
        monthlyInsurance *= .66;
    }
    if (ev) {
        cost *= 1.16;
        gpm = 0;
    }
    if (extravagant) {
        cost *= 1.3;
        gpm *= 1.15;
        monthlyInsurance *= 1.8;
    }
    const image = ev ? (extravagant ?
        "src/resources/Lux car icon ev.svg"
        : "src/resources/Car icon ev.svg") : (extravagant ?
        "src/resources/Lux car icon.svg" :
        "src/resources/Car icon.svg");
    const sellValue = gameState.character.cars[garage].getSellValue(gameState.date);
    const loan = cost - allocatedMoney - cash - sellValue;

    return (<div className="flex flex-col gap-4 items-center">
            <div className="flex flex-row gap-4 items-center">
                <div className="flex flex-col gap-4 items-center">
                    <div className="flex gap-4">
                        <div
                            className={"eventButton w-60! panelButton duration-300! " + (used ? "bg-gray-400!" : "bg-gray-200!")}
                            onClick={() => {
                                setUsed(true);
                                refreshModel();
                            }}>
                            <p className="text-gray-700">Used</p>
                        </div>
                        <div
                            className={"eventButton w-60! panelButton duration-300! " + (!used ? "bg-gray-400!" : "bg-gray-200!")}
                            onClick={() => {
                                setUsed(false);
                                refreshModel();
                            }}>
                            <p className="text-gray-700">New</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div
                            className={"eventButton w-60! panelButton duration-300! " + (!ev ? "bg-gray-400!" : "bg-gray-200!")}
                            onClick={() => {
                                setEv(false);
                                refreshModel();
                            }}>
                            <p className="text-gray-700">Gas</p>
                        </div>
                        <div
                            className={"eventButton w-60! panelButton duration-300! " + (ev ? "bg-gray-400!" : "bg-gray-200!")}
                            onClick={() => {
                                setEv(true);
                                refreshModel();
                            }}>
                            <p className="text-gray-700">Electric</p>
                        </div>
                    </div>
                    <div
                        className={"eventButton w-60! panelButton duration-300! " + (extravagant ? "bg-gray-400!" : "bg-gray-200!")}
                        onClick={() => {
                            setExtravagant(!extravagant);
                            refreshModel();
                        }}>
                        <p className="text-gray-700">{extravagant ? "Extravagant" : "Normal"}</p>
                    </div>
                </div>
                <div>
                    <img src={image} className="w-130"></img>
                </div>
            </div>
            <h3>Cost: {gameState.formatter.format(cost)}</h3>
            <h3>Allocated money: {gameState.formatter.format(allocatedMoney)}</h3>
            <h3>Sell value of current car: {gameState.formatter.format(sellValue)}</h3>

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
                                setCash(Math.min(Math.max(e.target.valueAsNumber, 0), Math.ceil(100 * Math.min(gameState.character.savingsAccount.balance, cost - allocatedMoney - sellValue)) / 100));
                            }}>
                        </NumberInputAutoSelect>
                    </p>
                </div>
            </div>
            {loan > 0.001 ?
                <h3>Loan: {gameState.formatter.format(loan)}</h3>
                : <></>}
            <ButtonNext
                style="w-50 text-xl h-10 p-1 font-bold mt-2"
                text="Buy"
                action={() => {
                    gameState.character.satisfaction += (extravagant ? 3 : 1) * (used ? 1 : 2);
                    gameState.character.payMoney(Math.min(cash, cost - allocatedMoney - sellValue));
                    if (loan > 0.001)
                        gameState.character.addLoan(
                            new Loan("Car Loan", loan, gameState.character.savingsAccount, (used ? 1.1403 : 1.0967), true))
                    if (cost - allocatedMoney - sellValue < 0.001)
                        gameState.character.addMoney(allocatedMoney + sellValue - cost);
                    gameState.character.cars[garage] = new Car(cost, new Date(gameState.date), used ? 33 : 50, gpm, ev, monthlyInsurance, image, model, garage);
                    addCarGoal(gameState.date);
                    action(gameState);
                }}/>
        </div>
    );
}