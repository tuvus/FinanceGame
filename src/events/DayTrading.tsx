/* eslint-disable react-hooks/immutability */
import {type LifeEventElementProps} from "../EventManager.tsx";
import {useEffect, useState} from "react";
import {LineChart} from "../components/LineChart.tsx";
import random from "random";

function DayTradingGame({gameState}: LifeEventElementProps) {
    const [page, setPage] = useState(0);
    const [time, setTime] = useState(8);
    const [history, setHistory] = useState([{time: time + ":00", value: random.float(10, 420)}]);
    const [investmentAmount, setInvestmentAmount] = useState(500)

    useEffect(() => {
        const interval = setInterval(() => {
            if (page == 2) {
                if (time == 24) {
                    setPage((ppage) => ppage + 1);
                    return;
                }
                setHistory([...history, {
                    time: (time + 1) + ":00",
                    value: (history[history.length - 1].value * random.float(.9, 1.12))
                }]);
                setTime((ptime) => ptime + 1);
            }
        }, 1000);
        return () => clearTimeout(interval);
    }, [page, time, history]);

    if (page == 0) {
        return (<div className="flex flex-col w-full items-center">
            <div className="flex flex-col gap-2 w-1/2 rounded-2xl bg-amber-100 items-center p-2">
                <p className="text-gray-700"> A friend of yours invites you to an interesting proposition. "You know
                    regular
                    investing? Well, its a
                    little old fashioned and takes a while for that money to grow. There are many big corporations
                    making money off of day trading and now it is more accessible to us! Do you want to give it a go and
                    make some quick bucks?"</p>
                <div className="flex gap-2 justify-center">
                    <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                            onClick={() => gameState.lifeEventManager!.NextEvent()}>
                        No thanks
                    </button>
                    <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => setPage(page + 1)}>Yeah!
                    </button>
                </div>
            </div>
        </div>)
    } else if (page == 1) {
        return (<div className="flex flex-col w-full items-center">
                <div className="flex flex-col gap-2 w-1/2 rounded-2xl bg-amber-100 items-center p-2">
                    <p className="text-gray-700">"Great! Now, let me tell you a little secret that traditional investors don't
                        know. While stocks do go up over time there is a much greater potential for gains. If we buy
                        stocks at the dip and sell them at a spike then we will greatly outpace the other investors.
                        Buy low, sell quick!"
                    </p>
                    <h3 className="mt-4 text-gray-700">How much would you like to invest?</h3>
                    <p className="text-yellow-600">Available: {gameState.formatter.format(gameState.character.savingsAccount.balance + gameState.character.investmentAccount.balance)}</p>
                    <input className="w-80 bg-gray-200 rounded-xl p-1 text-gray-700 mt-2"
                           min={500}
                           value={investmentAmount}
                           onChange={(e) => setInvestmentAmount(e.target.valueAsNumber)}
                           type="number">
                    </input>
                    <div className="flex gap-2 justify-center">
                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                onClick={() => gameState.lifeEventManager!.NextEvent()}>Cancel
                        </button>
                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => {
                            const fromInvestment = Math.min(gameState.character.investmentAccount.balance, investmentAmount);
                            gameState.character.investmentAccount.balance -= fromInvestment;
                            const fromSavings = Math.min(gameState.character.savingsAccount.balance, investmentAmount - fromInvestment);
                            gameState.character.savingsAccount.balance -= fromSavings;
                            if (investmentAmount - fromInvestment - fromSavings > 0.001) {
                                gameState.character.addCreditDebt(investmentAmount - fromInvestment - fromSavings);
                            }
                            setPage(page + 1);
                        }}>Confirm
                        </button>
                    </div>
                </div>
            </div>
        )
    } else if (page == 2) {
        return (<div className="flex flex-col w-full items-center">
            <div className="flex flex-col gap-2 w-1/2 rounded-2xl bg-amber-100 items-center p-2">
                <LineChart className="h-60 w-120" data={history}
                           index="time"
                           showLegend={false}
                           minValue={Math.min(...history.map(h => h.value))}
                           maxValue={Math.max(...history.map(h => h.value))}
                           aria-hidden="true"
                           categories={["value"]}
                           valueFormatter={(number: number) => gameState.compactFormatter.format(number)}/>
            </div>
        </div>)
    } else {
        return (<div>
            Great Job! You probably lost money!
            <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                    onClick={() => gameState.lifeEventManager!.NextEvent()}>Awww
            </button>
        </div>)
    }
}

export default DayTradingGame