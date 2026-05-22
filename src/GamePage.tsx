import './App.css'
import random from "random";
import {useState} from "react";
import {LineChart} from "./components/LineChart.tsx";

type GameProps = {
    fname: string; lname: string;
}

class Account {
    name: string;
    balance: number;
    history: {date: year, balance: number}[];
    constructor(name:string, balance: number, date: year) {
        this.name = name;
        this.balance = balance;
        this.history = [{date: date, balance: balance}];
    }
}

function GamePage({fname, lname}: GameProps) {
    const formatter = new Intl.NumberFormat("en", {style: "currency", currency: "USD", maximumFractionDigits: 2});
    const compactFormatter = new Intl.NumberFormat("en", {style: "currency", currency: "USD", notation: "compact", compactDisplay: "short"});
    const [year, setYear] = useState(random.int(1940, 2010));
    const [savingsAccount] = useState({a: new Account("Savings Account", random.float(10000, 30000), year)});
    const [page, setPage] = useState(0);
    const [salary] = useState(59999);
    const [pinvestments, setpinvestments] = useState(0);
    const [pretirement, setpretirement] = useState(0);
    const [pleisure, setpleisure] = useState(40);
    const [investmentAccount] = useState({a: new Account("Investment Account", 0, year)});
    const [indexShares, setIndexShares] = useState(0);
    const [indexShareValue, setIndexShareValue] = useState(random.int(7000, 50000) / 100);
    const [indexHistory, setIndexHistory] = useState([{date: year, value: indexShareValue}])

    const taxes = salary * .32;
    const livingExpenses = 32000;

    const takehomemoney = salary - taxes - livingExpenses;
    const newSavings = takehomemoney * ((100 - pinvestments - pretirement - pleisure) / 100);

    const pages = [
        <div className="flex flex-col gap-2 items-center">
            <h1>Payday!</h1>
            <p className="text-yellow-600">{formatter.format(salary)} paycheck</p>
            <p className="text-red-800">-{formatter.format(taxes)} taxes</p>
            <p className="text-red-800">-{formatter.format(livingExpenses)} living expenses</p>
            <br/>
            <p className="text-green-700">= {formatter.format(takehomemoney)} take home</p>
            <button className="w-80 text-xl h-10 font-bold" onClick={() => setPage(page + 1)}><h3>Next: Allocating
                money</h3></button>
        </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Allocations!</h1>
            <p className="text-green-700">{formatter.format(takehomemoney)} to allocate</p>
            <label className="mt-2">
                Investments: <input name="pinvestments" className="w-12"
                                    min="0"
                                    defaultValue={pinvestments}
                                    onChange={e => setpinvestments(Math.min(1000, Math.max(0, e.target.valueAsNumber)))}
                                    type="number">
            </input>% {formatter.format(takehomemoney * (pinvestments / 100))}
            </label>
            <label className="mt-2">
                Retirement: <input name="pretirement" className="w-12"
                                   min="0"
                                   defaultValue={pretirement}
                                   onChange={e => setpretirement(Math.min(1000, Math.max(0, e.target.valueAsNumber)))}
                                   type="number">
            </input>% {formatter.format(takehomemoney * (pretirement / 100))}
            </label>
            <label className="mt-2">
                Leisure: <input name="pleisure" className="w-12"
                                min="0"
                                defaultValue={pleisure}
                                onChange={e => setpleisure(Math.min(1000, Math.max(0, e.target.valueAsNumber)))}
                                type="number">
            </input>% {formatter.format(takehomemoney * pleisure / 100)}
            </label>
            <label className="mt-2">
                Savings: {100 - pinvestments - pretirement - pleisure}% {formatter.format(newSavings)}
            </label>
            <div className="flex gap-2">
                <h3 className={newSavings > 0 ? "text-green-700" : "text-red-800"}>
                    New Balance: {formatter.format(savingsAccount.a.balance + newSavings)}</h3>
            </div>
            <button className="w-80 text-xl h-10 font-bold" onClick={() => {
                setPage(page + 1);
                savingsAccount.a.balance += newSavings;
                investmentAccount.a.balance += takehomemoney * pinvestments / 100
            }}><h3>Next: Investments</h3></button>
        </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Investment Portfolio</h1>
            <p className="mt-2 text-yellow-600">
                Uninvested: {formatter.format(investmentAccount.a.balance)}
            </p>
            <div className="flex flex-col items-center bg-amber-100 rounded-xl p-4 m-4 gap-1">
                <h3 className="text-gray-700 font-bold">Index fund</h3>
                <p className="text-gray-700">{formatter.format(indexShareValue)} per share</p>
                <p className="text-gray-700">
                    Shares: {Math.round(indexShares * 100) / 100} ({formatter.format(indexShares * indexShareValue)})
                </p>
                <div className="flex gap-2">
                <button className="w-40 text-xl h-10 font-bold" onClick={() => {
                    let toBuy = parseInt(prompt("How many shares do you want to buy?", (Math.floor(investmentAccount.a.balance * 100 / indexShareValue) / 100).toString()));
                    toBuy = Math.floor(Math.min(toBuy, investmentAccount.a.balance / indexShareValue) * 100) / 100;
                    if (toBuy.valueOf() <= 0 || isNaN(toBuy)) return;
                    setIndexShares(indexShares + toBuy);
                    investmentAccount.a.balance -= toBuy * indexShareValue;
                }}><h3>Buy</h3></button>
                {indexShares > 0 ? <button className="w-40 text-xl h-10 font-bold" onClick={() => {
                    let toSell = parseInt(prompt("How many shares do you want to sell?", (Math.floor(indexShares * 100) / 100).toString()));
                    toSell = Math.floor(Math.min(toSell, indexShares) * 100) / 100;
                    if (toSell.valueOf() <= 0 || isNaN(toSell)) return;
                    setIndexShares(indexShares - toSell);
                    investmentAccount.a.balance += toSell * indexShareValue;
                }}><h3>Sell</h3></button> : <></>}
                </div>
                <LineChart className="h-60 w-120" data={indexHistory}
                           index="date"
                           showLegend={false}
                           minValue={Math.min(...indexHistory.map(h => h.value))}
                           maxValue={Math.max(...indexHistory.map(h => h.value))}
                           aria-hidden="true"
                           categories={["value"]}
                           valueFormatter={(number: number) => compactFormatter.format(number)}/>
            </div>
            <button className="w-80 text-xl h-10 font-bold" onClick={() => {
                setPage(0);
                setYear(year + 1);
                setIndexShareValue(indexShareValue * random.float(.93, 1.12))
                setIndexHistory([...indexHistory, ({date: year, value: indexShareValue})]);
            }}><h3>Next year</h3></button>
        </div>
    ];
    return (
        <>
            {pages[page]}
            <div className="flex flex-col absolute bottom-0 w-full g-4 mb-2">
                <h2>{fname} {lname}</h2>
                <h3 className="text-yellow-600">Bank Account: {formatter.format(savingsAccount.a.balance)}</h3>
                <p>{year}</p>
            </div>

        </>
    );
}

export default GamePage