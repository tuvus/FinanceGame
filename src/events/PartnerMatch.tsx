/* eslint-disable react-hooks/immutability */
import {type GameStateProps, Loan} from "../Data.tsx";
import {useState} from "react";
import {femaleNames, lastNames, maleNames} from "../Constants.tsx";
import random from "random";
import {ButtonNext} from "../Utils.tsx";
import {LifeEvent} from "../EventManager.tsx";
import {Car} from "../Character.tsx";

export default function PartnerMatch({gameState}: GameStateProps) {
    const getRandomFName = () => {
        let names: string[];
        if (gameState.character.partnerAspiration == "Girlfriend")
            names = femaleNames.filter(n => n != gameState.character.firstName);
        else if (gameState.character.partnerAspiration == "Boyfriend")
            names = maleNames.filter(n => n != gameState.character.firstName);
        else names = [...femaleNames, ...maleNames].filter(n => n != gameState.character.firstName);
        return names[random.int(0, names.length) - 1];
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
                <p>What is {gameState.character.partnerPronoun2} name?</p>

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
                    gameState.character.partnerAge = gameState.character.age + random.int(-3,3);
                    gameState.character.satisfaction += 5;
                    const partnerSalary = (gameState.character.education == "Bachelors" ? 78000 : (gameState.character.education == "Associates" ? 57000 : (gameState.character.education == "Trade School" ? 53000 : 48000))) * gameState.inflation * random.float(.9, 1.1);
                    const partnerLoans = (gameState.character.education == "Bachelors" ? 24000 : (gameState.character.education == "Associates" ? 8000 : (gameState.character.education == "Trade School" ? 9000 : 0))) * gameState.inflation * random.float(.9, 1.1);
                    const partnerSavings = 20000 * gameState.inflation;
                    gameState.lifeEventManager!.replaceEvent(new LifeEvent("Combining finances", gameState.date,
                        <div className="flex flex-col w-full items-center">
                            <div className="flex flex-col justify-center gap-2 w-3/4">
                                <p>You and your partner would like to combine finances, this not only makes it easier to
                                    live together, but also provides some tax benefits.</p>
                                <p>{gameState.character.partnerPronoun2!.toUpperCase()[0] + gameState.character.partnerPronoun2!.substring(1)} current
                                    salary is {gameState.formatter.format(partnerSalary)}, and they
                                    have {gameState.formatter.format(partnerSavings)} in savings.</p>
                                {gameState.character.education == "Trade School" ? <p>They also went to trade school and
                                    have {gameState.formatter.format(partnerLoans)} of debt.</p> : <></>}
                                {gameState.character.education == "Associates" ?
                                    <p>They also went to community college and
                                        have {gameState.formatter.format(partnerLoans)} of debt.</p> : <></>}
                                {gameState.character.education == "Bachelors" ?
                                    <p>They also went to college and have {gameState.formatter.format(partnerLoans)} of
                                        debt.</p> : <></>}
                            </div>
                            <ButtonNext style="w-50 text-xl h-10 p-1 font-bold mt-2"
                                        text="Awsome!" action={() => {
                                if (gameState.character.education == "Trade School") {
                                    gameState.character.addLoan(new Loan("Trade School Debt", partnerLoans, gameState.character.savingsAccount, 1.067, true));
                                } else if (gameState.character.education != "High School") {
                                    gameState.character.addLoan(new Loan("College Debt", partnerLoans, gameState.character.savingsAccount, 1.067, true));
                                }
                                gameState.character.addMoney(partnerSavings);
                                gameState.character.monthlyLivingExpenses.set("Rent", gameState.character.monthlyLivingExpenses.get("Rent")! * 1.7);
                                gameState.character.monthlyLivingExpenses.set("Utilities", gameState.character.monthlyLivingExpenses.get("Utilities")! * 1.5);
                                gameState.character.monthlyLivingExpenses.set("Groceries", gameState.character.monthlyLivingExpenses.get("Groceries")! * 1.7);
                                gameState.character.monthlyLivingExpenses.set("Internet", gameState.character.monthlyLivingExpenses.get("Internet")! * 1.4);
                                gameState.character.monthlyLivingExpenses.set("Phone Data", gameState.character.monthlyLivingExpenses.get("Phone Data")! * 2);
                                gameState.character.monthlyLivingExpenses.set("Health Insurance", gameState.character.monthlyLivingExpenses.get("Health Insurance")! * 2);
                                gameState.character.partnerSalary = partnerSalary;
                                gameState.character.cars = [...gameState.character.cars, new Car(32000, new Date(gameState.date.getFullYear(), random.int(0, 11), random.int(1, 28)), 20, 25, false, 180, "src/resources/Car icon.svg")]
                                gameState.lifeEventManager!.replaceEvent(new LifeEvent("Planning for a wedding", gameState.date,
                                    <div className="flex flex-col w-full items-center">
                                        <div className="flex flex-col justify-center gap-2 w-3/4">
                                            <p>After settling down together you two would like to make your relationship
                                                official. Usually this involves a wedding ceremony, which can be very
                                                expensive. How would you like to host your wedding?</p>
                                            <div className="flex justify-center gap-8 mt-6">
                                                <div
                                                    className="eventButton panelButton"
                                                    onClick={() => {
                                                        gameState.character.satisfaction += 1;
                                                        gameState.character.payMoney(500 * gameState.inflation);
                                                        gameState.lifeEventManager!.addEvent(new LifeEvent("Wedding day", gameState.getRandomDateFromGameYear(3),
                                                            <div className="flex w-full justify-center">
                                                                <div className="flex flex-col items-center w-3/4">
                                                                    <p>
                                                                        Wow, the wedding really flew by!
                                                                    </p>
                                                                    <p>
                                                                        The wedding was a blast! Your family, relatives
                                                                        and close friends traveled to congratulate you
                                                                        two on your marriage. The event was smaller than
                                                                        other weddings but much more personal. You felt
                                                                        like you could connect with those who came much
                                                                        better. Now you have some gifts to open.
                                                                    </p>
                                                                    <ButtonNext
                                                                        style="w-50 text-xl h-10 p-1 font-bold mt-2"
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
                                                        gameState.lifeEventManager!.addEvent(new LifeEvent("Wedding day", gameState.getRandomDateFromGameYear(3),
                                                            <div className="flex w-full justify-center">
                                                                <div className="flex flex-col items-center w-3/4">
                                                                    <p>
                                                                        Wow, the wedding really flew by!
                                                                    </p>
                                                                    <p>
                                                                        The wedding was a blast! Your family, friends
                                                                        and distant relatives traveled to congratulate
                                                                        you two on your marriage. You met some friends
                                                                        that you hadn't seen since high school! Now you
                                                                        have some gifts to open.
                                                                    </p>
                                                                    <ButtonNext
                                                                        style="w-50 text-xl h-10 p-1 font-bold mt-2"
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
                                                        gameState.lifeEventManager!.addEvent(new LifeEvent("Wedding day", gameState.getRandomDateFromGameYear(3),
                                                            <div className="flex w-full justify-center">
                                                                <div className="flex flex-col items-center w-3/4">
                                                                    <p>
                                                                        Wow, the wedding really flew by!
                                                                    </p>
                                                                    <p>
                                                                        The wedding was a blast! Your family, friends,
                                                                        distant relatives, and some people who you don't
                                                                        quite remember traveled to congratulate you two
                                                                        on your marriage. You met some friends that you
                                                                        hadn't seen since high school! Now you have some
                                                                        gifts to open.
                                                                    </p>
                                                                    <ButtonNext
                                                                        style="w-50 text-xl h-10 p-1 font-bold mt-2"
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
                            }}/>
                        </div>, true));
                }}></ButtonNext>
            </div>
        </div>
    );
}