/* eslint-disable react-hooks/immutability */
import type {GameStateProps} from "../Data.tsx";
import {useState} from "react";
import {femaleNames, lastNames, maleNames} from "../Constants.tsx";
import random from "random";
import {ButtonNext} from "../Utils.tsx";

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
                <p>You found a partner! What is their name?</p>

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
                    gameState.lifeEventManager!.nextEvent();
                }}></ButtonNext>
            </div>
        </div>
    );
}