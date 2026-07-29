/* eslint-disable react-hooks/immutability */
import type {GameStateProps} from "../Data.tsx";
import {useState} from "react";
import {femaleNames, lastNames, maleNames} from "../Constants.tsx";
import random from "random";
import {ButtonNext} from "../Utils.tsx";
import {LifeEvent} from "../EventManager.tsx";

export default function PartnerMatch({gameState}: GameStateProps) {
    const getRandomFName = () => {
        return gameState.character.partnerAspiration == "Girlfriend" ?
            femaleNames.filter(n => n != gameState.character.firstName)[random.int(0, femaleNames.filter(n => n != gameState.character.firstName).length) - 1]
            : maleNames.filter(n => n != gameState.character.firstName)[random.int(0, maleNames.filter(n => n != gameState.character.firstName).length) - 1];
    }
    const getRandomLName = () => {
        return lastNames.filter(n => n != gameState.character.lastName)[random.int(0, lastNames.filter(n => n != gameState.character.lastName).length) - 1];
    }
    const [firstName, setFirstName] = useState(getRandomFName());
    const [lastName, setLastName] = useState(getRandomLName());

    return (
        <div className="flex flex-col w-full items-center">
            <div className="flex flex-col items-center gap-2 w-3/4">
                <p>After many dates and breakups you finally found a partner to start a long-term relationship with!</p>
                <p>What is their name?</p>

                <label>
                    First Name: <input className="w-38 text-gray-700 bg-gray-200 rounded-xl p-1"
                                       defaultValue={firstName}
                                       onChange={e => setFirstName(e.target.value)}
                                       type="text"></input>
                </label>
                <label>
                    Last Name: <input className="w-38 text-gray-700 bg-gray-200 rounded-xl p-1"
                                      defaultValue={lastName}
                                      onChange={e => setLastName(e.target.value)}
                                      type="text"></input>
                </label>
                <ButtonNext style="w-50 text-xl h-10 p-1 font-bold mt-2" text="Awsome!" action={() => {
                    gameState.character.partnerFirstName = firstName;
                    gameState.character.partnerLastName = lastName;
                    gameState.character.satisfaction += 5;
                    gameState.lifeEventManager!.replaceEvent(new LifeEvent("Planning for a wedding", gameState.date,
                        <div className="flex flex-col w-full items-center">
                            <div className="flex flex-col justify-center gap-2 w-3/4">
                                <p>After settling down together you two would like to make your relationship official.
                                    Usually this involves a wedding ceremony, which can be very expensive. How would you
                                    like to host your wedding?</p>
                                <div className="flex justify-center gap-8 mt-6">
                                    <div
                                        className="eventButton panelButton"
                                        onClick={() => {
                                            gameState.character.satisfaction += 1;
                                            gameState.character.payMoney(500 * gameState.inflation);
                                            gameState.lifeEventManager!.addEvent(new LifeEvent("Wedding day", new Date(gameState.date.getFullYear() + 1, random.int(0, 11), random.int(1, 28)),
                                                <div className="flex w-full justify-center">
                                                    <div className="flex flex-col items-center w-3/4">
                                                        <p>
                                                            Wow, the wedding really flew by!
                                                        </p>
                                                        <p>
                                                            The wedding was a blast! Your family, relatives and close
                                                            friends traveled to congratulate you two on your marriage.
                                                            The event was smaller than other weddings but much more
                                                            personal. You felt like you could connect with those who
                                                            came much better. Now you have some gifts to open.
                                                        </p>
                                                        <ButtonNext style="w-50 text-xl h-10 p-1 font-bold mt-2"
                                                                    text="Awsome!" action={() => {
                                                            gameState.character.satisfaction += 1;
                                                            gameState.character.addMoney(500 * random.float(.9, .11) * gameState.inflation);
                                                            gameState.lifeEventManager!.nextEvent();
                                                        }}/>
                                                    </div>
                                                </div>, true));
                                            gameState.lifeEventManager!.nextEvent();
                                        }}>
                                        <h3 className="text-gray-700 font-bold">Simple wedding</h3>
                                        <p className="text-gray-700">{gameState.formatter.format(500 * gameState.inflation)}</p>
                                        <p className="text-gray-700">Family and close friends</p>
                                    </div>
                                    <div
                                        className="eventButton panelButton"
                                        onClick={() => {
                                            gameState.character.satisfaction += 1;
                                            gameState.character.payMoney(28000 * gameState.inflation);
                                            gameState.lifeEventManager!.addEvent(new LifeEvent("Wedding day", new Date(gameState.date.getFullYear() + 1, random.int(0, 11), random.int(1, 28)),
                                                <div className="flex w-full justify-center">
                                                    <div className="flex flex-col items-center w-3/4">
                                                        <p>
                                                            Wow, the wedding really flew by!
                                                        </p>
                                                        <p>
                                                            The wedding was a blast! Your family, friends and distant
                                                            relatives traveled to congratulate you two on your marriage.
                                                            You met some friends that you hadn't seen since high school!
                                                            Now you have some gifts to open.
                                                        </p>
                                                        <ButtonNext style="w-50 text-xl h-10 p-1 font-bold mt-2"
                                                                    text="Awsome!" action={() => {
                                                            gameState.character.satisfaction += 1;
                                                            gameState.character.addMoney(1000 * random.float(.9, .11) * gameState.inflation);
                                                            gameState.lifeEventManager!.nextEvent();
                                                        }}/>
                                                    </div>
                                                </div>, true));
                                            gameState.lifeEventManager!.nextEvent();
                                        }}>
                                        <h3 className="text-gray-700 font-bold">Sizable wedding</h3>
                                        <p className="text-gray-700">{gameState.formatter.format(28000 * gameState.inflation)}</p>
                                        <p className="text-gray-700">~100 people</p>
                                    </div>
                                    <div
                                        className="eventButton panelButton"
                                        onClick={() => {
                                            gameState.character.satisfaction += 1;
                                            gameState.character.payMoney(45000 * gameState.inflation);
                                            gameState.lifeEventManager!.addEvent(new LifeEvent("Wedding day", new Date(gameState.date.getFullYear() + 1, random.int(0, 11), random.int(1, 28)),
                                                <div className="flex w-full justify-center">
                                                    <div className="flex flex-col items-center w-3/4">
                                                        <p>
                                                            Wow, the wedding really flew by!
                                                        </p>
                                                        <p>
                                                            The wedding was a blast! Your family, friends, distant
                                                            relatives, and some people who you don't quite remember
                                                            traveled to congratulate you two on your marriage. You met
                                                            some friends that you hadn't seen since high school! Now you
                                                            have some gifts to open.
                                                        </p>
                                                        <ButtonNext style="w-50 text-xl h-10 p-1 font-bold mt-2"
                                                                    text="Awsome!" action={() => {
                                                            gameState.character.satisfaction += 1;
                                                            gameState.character.addMoney(1000 * random.float(.9, .11) * gameState.inflation);
                                                            gameState.lifeEventManager!.nextEvent();
                                                        }}/>
                                                    </div>
                                                </div>, true));
                                            gameState.lifeEventManager!.nextEvent();
                                        }}>
                                        <h3 className="text-gray-700 font-bold">Large wedding</h3>
                                        <p className="text-gray-700">{gameState.formatter.format(45000 * gameState.inflation)}</p>
                                        <p className="text-gray-700">~200 people</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        , true));
                }}></ButtonNext>
            </div>
        </div>
    );
}