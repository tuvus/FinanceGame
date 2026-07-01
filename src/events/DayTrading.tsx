/* eslint-disable react-hooks/immutability */
import {type LifeEventElementProps} from "../EventManager.tsx";
import {useEffect, useState} from "react";
import {LineChart} from "../components/LineChart.tsx";
import random from "random";
import {CalculateTaxes} from "../Utils.tsx";

function DayTradingGame({gameState}: LifeEventElementProps) {
    const [page, setPage] = useState(0);
    const [hours, setHours] = useState(8);
    const [minutes, setMinutes] = useState(0);
    const [history, setHistory] = useState(() => {
        let h = [{time: "6:00", value: random.float(10, 420) * gameState.inflation}]
        let hminute = 0;
        let hhour = 6;
        for (let i = 0; i < 2 * 6; i++) {
            const nextMinutes = (hminute+ 10) % 60;
            const nextHours = hminute+ 10 == 60 ? hhour + 1 : hhour;
            h = [...h, {
                time: nextHours + ":" + (nextMinutes == 0 ? "00" : nextMinutes),
                value: (h[h.length - 1].value * random.float(.99, 1.0101))
            }];
            hhour = nextHours;
            hminute = nextMinutes;
        }
        return h;
    });
    const [investmentAmount, setInvestmentAmount] = useState(500);
    const [currentAmount, setCurrentAmount] = useState(500);
    const [buyIndex, setBuyIndex] = useState<number | null>(null);
    const taxes = currentAmount > investmentAmount ? CalculateTaxes(gameState.character.taxableIncome + currentAmount - investmentAmount) - CalculateTaxes(gameState.character.taxableIncome) : 0;
    const [companyName, setCompanyName] = useState("DefaultCompany")
    const [companies] = useState(() => {
        const companyNames = ["Environ", "Invtn Gmbh", "Standard Electric", "General Oil", "UnReal Estate", "Extra-Electronics Inc", "Insider Insurance", "Big Data Corp", "Hellman-Dough"]
        let value: string[] = [];
        for (let i = 0; i < 3; i++) {
            const ci = random.int(0, companyNames.length - 1);
            value = [...value, companyNames[ci]];
            companyNames.splice(ci, 1);
        }
        return value;
    })
    const startEndValue = investmentAmount * history[history.length - 1].value / history[12].value;
    const startEndTaxes = startEndValue > investmentAmount ? CalculateTaxes(gameState.character.taxableIncome + startEndValue - investmentAmount) - CalculateTaxes(gameState.character.taxableIncome) : 0;
    useEffect(() => {
        const interval = setInterval(() => {
            if (page == 3) {
                if (hours == 24) {
                    return;
                }
                const nextMinutes = (minutes + 10) % 60;
                const nextHours = minutes + 10 == 60 ? hours + 1 : hours;
                setHistory([...history, {
                    time: nextHours + ":" + (nextMinutes == 0 ? "00" : nextMinutes),
                    value: (history[history.length - 1].value * random.float(.99, 1.0101))
                }]);
                setMinutes(nextMinutes);
                setHours(nextHours);
            }
        }, 500);
        return () => clearTimeout(interval);
    }, [page, minutes, hours, history]);

    if (page == 0) {
        return (<div className="flex flex-col w-full items-center">
            <div className="flex flex-col gap-2 w-1/2 rounded-2xl bg-amber-100 items-center p-2">
                <p className="text-gray-700"> A friend of yours invites you to an interesting proposition. "You know
                    regular investing? Well, its a little old fashioned and takes a while for that money to grow. There
                    are many big corporations making money off of day trading and now it is more accessible to us! Do
                    you want to give it a go and make some quick bucks?"</p>
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
                    <p className="text-gray-700">"Great! Now, let me tell you a little secret that traditional investors
                        don't know. While stocks go up over time there is a much greater potential for gains. If we
                        buy stocks at the dip and sell them at a spike then we will greatly outpace the other investors.
                        Buy low, sell quick!"
                    </p>
                    <h3 className="mt-4 text-gray-700">How much would you like to invest from your investment account?</h3>
                    <p className="text-yellow-600">Available: {gameState.formatter.format(gameState.character.investmentAccount.balance)}</p>
                    <p className="text-gray-700">$
                        <input className="w-80 bg-gray-200 rounded-xl p-1 text-gray-700 mt-2"
                               min={1}
                               value={investmentAmount}
                               onChange={(e) => {
                                   setInvestmentAmount(e.target.valueAsNumber);
                                   setCurrentAmount(e.target.valueAsNumber);
                               }}
                               type="number">
                        </input></p>
                    <div className="flex gap-2 justify-center">
                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                onClick={() => gameState.lifeEventManager!.NextEvent()}>Cancel
                        </button>
                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => {
                            const fromInvestment = Math.min(gameState.character.investmentAccount.balance, investmentAmount);
                            gameState.character.investmentAccount.balance -= fromInvestment;
                            if (investmentAmount - fromInvestment > 0.001) {
                                gameState.character.addCreditDebt(investmentAmount - fromInvestment);
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
                <p className="text-gray-700">
                    "Now you need to select a company. Which do you think is going to do hot?"
                </p>
                {companies.map((c) =>
                    <div key={c} className="eventButton panelButton bg-gray-200!" onClick={() => {
                        setCompanyName(c);
                        setPage(page + 1);
                    }}>
                        <p className="text-gray-700">
                            {c}
                        </p>
                    </div>
                )}
            </div>
        </div>);
    } else if (page == 3) {
        return (<div className="flex flex-col w-full items-center">
            <div className="flex flex-col gap-2 rounded-2xl bg-amber-100 items-center p-2">
                <h2 className="text-gray-700! font-bold!">{companyName}</h2>
                <LineChart className="h-100 w-200 mb-2" data={history}
                           index="time"
                           showLegend={false}
                           minValue={Math.min(...history.map(h => h.value))}
                           maxValue={Math.max(...history.map(h => h.value))}
                           aria-hidden="true"
                           categories={["value"]}
                           valueFormatter={(number: number) => gameState.compactFormatter.format(number)}/>
                <h3 className={buyIndex ? "text-yellow-600" : "text-gray-700"}>{buyIndex ? gameState.formatter.format(
                    currentAmount / history[buyIndex].value * history[history.length - 1].value
                ) : gameState.formatter.format(currentAmount)}</h3>
                {hours == 24 ?
                    <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => {
                        if (buyIndex != null) {
                            setCurrentAmount(currentAmount / history[buyIndex].value * history[history.length - 1].value);
                            setBuyIndex(null);
                        }
                        setPage(page + 1);
                    }}>Done</button>
                    : (buyIndex ?
                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => {
                            setCurrentAmount(currentAmount / history[buyIndex].value * history[history.length - 1].value);
                            setBuyIndex(null);
                        }}>Sell</button>
                        : <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => {
                            setBuyIndex(history.length - 1);
                        }}>Buy</button>)
                }
            </div>
        </div>)
    } else {
        return (<div className="flex flex-col w-full items-center">
                <div className="flex flex-col gap-2 w-1/2 rounded-2xl bg-amber-100 items-center p-2">
                    {currentAmount > investmentAmount ?
                        <>
                            <h2 className="text-gray-700!">You're a winner!</h2>
                            <p className="text-gray-700">
                                Any gains are taxed as income.
                            </p>
                        </>
                        : (currentAmount < investmentAmount ?
                                <p className="text-gray-700">
                                    Awww, looks like you lost some money! Try again next time!
                                </p> :
                                <p className="text-gray-700">
                                    You didn't do any trades! That won't make you money!
                                </p>
                        )}
                    <p className="text-gray-700">
                        Starting Balance: {gameState.formatter.format(investmentAmount)}
                    </p>
                    {currentAmount > investmentAmount ?
                        <>
                            <p className="text-green-700">Gains: {gameState.formatter.format(currentAmount - investmentAmount)} +{Math.floor((currentAmount - investmentAmount) * 100 / investmentAmount)}%</p>
                            <p className="text-red-800">Taxes: -{gameState.formatter.format(taxes)}</p>
                        </>
                        : (currentAmount < investmentAmount ?
                                <p className="text-red-800">Losses: {gameState.formatter.format(currentAmount - investmentAmount)} {Math.floor((currentAmount - investmentAmount) * 100 / investmentAmount)}%</p> :
                                <p className="text-gray-700">Difference: {gameState.formatter.format(currentAmount - investmentAmount)}</p>
                        )}
                    <p className="text-gray-700">
                        Ending Balance: {gameState.formatter.format(currentAmount - taxes)}
                    </p>
                    {startEndValue > investmentAmount ?
                        <p className="text-gray-700 pt-2">A long-term investment over this period would have
                            yielded {gameState.formatter.format(startEndValue - startEndTaxes)} (Tax included)</p>
                        : <></>}
                    <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                            onClick={() => {
                                gameState.character.investmentAccount.balance += currentAmount - taxes;
                                gameState.lifeEventManager!.NextEvent();
                            }}>
                        {currentAmount > investmentAmount ? "Nice!" : "Awww"}
                    </button>
                </div>
            </div>
        )
    }
}

export default DayTradingGame