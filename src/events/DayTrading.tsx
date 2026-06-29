import {type LifeEventElementProps} from "../EventManager.tsx";
import {useEffect, useState} from "react";
import {LineChart} from "../components/LineChart.tsx";
import random from "random";

function DayTradingGame({gameState, lifeEventManager}: LifeEventElementProps) {
    const [page, setPage] = useState(0);
    const [time, setTime] = useState(8);
    const [history, setHistory] = useState([{time: time + ":00", value: random.float(10, 420)}]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (page == 2) {
                if (time == 24) {
                    setPage(page + 1);
                    return;
                }
                setHistory([...history, {
                    time: (time + 1) + ":00",
                    value: (history[history.length - 1].value * random.float(.9, 1.12))
                }]);
                setTime(time + 1);
            }
        }, 5000);
        return () => clearTimeout(interval);
    }, []);

    if (page == 0) {
        return (<div>
            <p>A friend of yours invites you to an interesting proposition. "You know regular investing? Well, its a
                little old fashioned and takes a while for that money to grow. There are many big corporations
                making money off of day trading and now it is more accessible to us! Do you want to give it a go and
                make some quick bucks?"</p>
            <div className="flex gap-2 justify-center">
                <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => lifeEventManager.NextEvent()}>
                    No thanks
                </button>
                <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => setPage(page + 1)}>Yeah!
                </button>
            </div>
        </div>)
    } else if (page == 1) {
        return (<div>
            <p>"Great! Now, let me tell you a little secret that traditional investors don't know. While
                stocks do go up over time there is a much greater potential for gains. If we buy stocks
                at the dip and sell them at a spike then we will greatly outpace the other investors.
                Buy low, sell quick!"
            </p>
            <p>How much would you like to invest?</p>
            <div className="flex gap-2 justify-center">
                <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => setPage(page + 1)}>Cancel
                </button>
                <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => setPage(page + 1)}>Confirm
                </button>
            </div>
        </div>)
    } else if (page == 2) {
        return (<div>
            <LineChart className="h-60 w-120" data={history}
                       index="value"
                       showLegend={false}
                       minValue={Math.min(...history.map(h => h.value))}
                       maxValue={Math.max(...history.map(h => h.value))}
                       aria-hidden="true"
                       categories={["value"]}
                       valueFormatter={(number: number) => gameState.compactFormatter.format(number)}/>
        </div>)
    } else {
        return (<div>
            Great Job! You probably lost money!
            <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => lifeEventManager.NextEvent()}>Awww
            </button>
        </div>)
    }
}

export default DayTradingGame