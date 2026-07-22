/* eslint-disable react-hooks/immutability */
import {GameState} from "../Data.tsx";
import {CopyDate} from "../Utils.tsx";
import {Car, Goal} from "../Character.tsx";
import random from "random";

export type CarShopProps = {
    gameState: GameState;
    action: (gameState: GameState) => void;
}

export function CarShop({gameState, action}: CarShopProps) {
    const addCarGoal = (buyDate: Date) => {
        const targetDate = new Date(gameState.character.car.getAvgExpirationDate().toString());
        console.log("aaaaa")
        gameState.character.checkGoalOfName(gameState, "Buy a new car");
        gameState.character.addGoal(new Goal("Buy a new car",
            "Your current car isn't going to last forever, you should plan to buy a new one within one year of " + targetDate.getFullYear(),
            gameState.character.car.getAvgExpirationDate(),
            (gameState) => gameState.character.car.buyDate.getFullYear()  > buyDate.getFullYear(),
            (gameState) => {
                gameState.character.satisfaction += 2;
                action(gameState);
            }));
    }
    return (<div className="grid grid-cols-2 w-208 jusify-center gap-4">
            <div className="eventButton panelButton" onClick={() => {
                gameState.character.satisfaction += 2;
                gameState.character.payMoney(25945 * gameState.inflation);
                gameState.character.car = new Car(25945 * gameState.inflation, new Date(gameState.date.getFullYear() - 3, random.int(0, 11), random.int(0, 28)), 20, 28, 120);
                addCarGoal(CopyDate(gameState.date));
                action(gameState);
            }}>
                <p className="text-gray-700">Buy a used car</p>
                <p className="text-red-800">{gameState.formatter.format(25945 * gameState.inflation)}</p>
            </div>
            <div className="eventButton panelButton" onClick={() => {
                gameState.character.satisfaction += 5;
                gameState.character.payMoney(49814 * gameState.inflation);
                gameState.character.car = new Car(49814 * gameState.inflation, new Date(gameState.date), 5, 32, 190);
                addCarGoal(CopyDate(gameState.date));
                action(gameState);
            }}>
                <p className="text-gray-700">Buy a new car</p>
                <p className="text-red-800">{gameState.formatter.format(49814 * gameState.inflation)}</p>
            </div>
            <div className="eventButton panelButton" onClick={() => {
                gameState.character.satisfaction += 6;
                gameState.character.payMoney(31000 * gameState.inflation);
                gameState.character.car = new Car(31000 * gameState.inflation, new Date(gameState.date.getFullYear() - 3, random.int(0, 11), random.int(0, 28)), 20, 27, 160);
                addCarGoal(CopyDate(gameState.date));
                action(gameState);
            }}>
                <p className="text-gray-700">Buy a used extravagant car</p>
                <p className="text-red-800">{gameState.formatter.format(31000 * gameState.inflation)}</p>
            </div>
            <div className="eventButton panelButton" onClick={() => {
                gameState.character.satisfaction += 12;
                gameState.character.payMoney(60000 * gameState.inflation);
                gameState.character.car = new Car(60000 * gameState.inflation, new Date(gameState.date), 5, 30, 320);
                addCarGoal(CopyDate(gameState.date));
                action(gameState);
            }}>
                <p className="text-gray-700">Buy a new extravagant car</p>
                <p className="text-red-800">{gameState.formatter.format(60000 * gameState.inflation)}</p>
            </div>
        </div>
    );
}