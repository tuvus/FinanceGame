/* eslint-disable react-hooks/immutability */
import type {LifeEventElementProps} from "../EventManager.tsx";
import {useState} from "react";
import random from "random";

function PromotionEvent({gameState}: LifeEventElementProps) {
    const [increase] = useState(random.float(1.03, 1.12));
    return (<div>
        <p>Your manager has offered you a promotion for your hard work!</p>
        <p>Old Salary: {gameState.formatter.format(gameState.character.salary)}</p>
        <p className="text-green-700">
            New Salary: {gameState.formatter.format(gameState.character.salary * increase)} +{Math.floor((increase - 1) * 100)}%
        </p>
        <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => {
            gameState.character.salary *= increase;
            gameState.character.satisfaction += random.int(4, 7) * increase;
            gameState.lifeEventManager!.NextEvent();
        }}>Nice!
        </button>
    </div>);
}

export default PromotionEvent;