/* eslint-disable react-hooks/immutability */
import {LifeEvent, type LifeEventElementProps} from "../EventManager.tsx";
import random from "random";

function BrokenLaptopEvent({gameState}: LifeEventElementProps) {

    return (
        <div className="flex flex-col w-full items-center mt-6 gap-4">
            <p className="w-3/4">Oops... You spilled coffee on your laptop and now it won't start. You need your
                laptop for
                your daily life and work. How should will you fix it?</p>
            <div className="flex justify-center gap-8 w-3/4">
                <div className="eventButton panelButton" onClick={() => {
                    const r = random.float();
                    if (r < .3) {
                        gameState.character.satisfaction -= 2;
                        gameState.character.payMoney(150 * gameState.inflation);
                        gameState.lifeEventManager!.ReplaceEvent(new LifeEvent("Laptop Fixed", gameState.lifeEventManager!.date,
                            <div className="flex flex-col w-full items-center mt-6 gap-4">
                                <p className="w-3/4">You sent your laptop into the repair shop and they were
                                    able to fix it and send it back within a few days.
                                </p>
                            </div>));
                    } else {
                        gameState.character.satisfaction -= 10;
                        gameState.character.payMoney(750 * gameState.inflation);
                        gameState.lifeEventManager!.ReplaceEvent(new LifeEvent("Laptop Unrepairable", gameState.lifeEventManager!.date,
                            <div className="flex flex-col w-full items-center mt-6 gap-4">
                                <p className="w-3/4">You sent your laptop into the repair shop but there was
                                    nothing they could do to fix it. Unfortunately, your worranty had expired
                                    and you had to pay for a new laptop.
                                </p>
                                <p className="text-red-800">{gameState.formatter.format(-750 * gameState.inflation)}</p>
                            </div>
                        ));
                    }
                }}>
                    <p className="text-gray-700">Send it to the repair shop</p>
                    <p className="text-red-800">{gameState.formatter.format(-150 * gameState.inflation)}</p>
                </div>
                <div className="eventButton panelButton" onClick={() => {
                    gameState.character.satisfaction -= 5;
                    gameState.character.payMoney(600 * gameState.inflation);
                    gameState.lifeEventManager!.NextEvent();
                }}>
                    <p className="text-gray-700">Buy a new cheap laptop as a replacement</p>
                    <p className="text-red-800">{gameState.formatter.format(-600 * gameState.inflation)}</p>
                </div>
                <div className="eventButton panelButton" onClick={() => {
                    gameState.character.satisfaction += 7;
                    gameState.character.payMoney(1200 * gameState.inflation);
                    gameState.lifeEventManager!.NextEvent();
                }}>
                    <p className="text-gray-700">Buy a fancier laptop as a replacement</p>
                    <p className="text-red-800">{gameState.formatter.format(-1200 * gameState.inflation)}</p>
                </div>
            </div>
        </div>
    );
}

export default BrokenLaptopEvent;