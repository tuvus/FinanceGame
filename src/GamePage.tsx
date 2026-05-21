import './App.css'
import random from "random";
import { useState} from "react";

type GameProps = {
    fname: string; lname: string;
}

function GamePage({fname, lname}: GameProps) {

    const [balance] = useState(random.float(10000, 30000));
    const formatter = new Intl.NumberFormat("en", {style: "currency", currency: "USD", maximumFractionDigits: 2});
    const [page, setPage] = useState(0);
    const [salary] = useState(59999)
    const [pinvestments, setpinvestments] = useState(0)
    const [pretirement, setpretirement] = useState(0)
    const [pleisure, setpleisure] = useState(40)

    const taxes = salary * .32;
    const livingExpenses = 32000;

    const takehomemoney =  salary - taxes - livingExpenses;

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
                                    defaultValue={pinvestments}
                                    onChange={e => setpinvestments(Math.min(100, Math.max(0, e.target.valueAsNumber)))}
                                    type="number">
               </input>% {formatter.format(takehomemoney * (pinvestments / 100))}
            </label>
            <label className="mt-2">
                Retirement: <input name="pretirement" className="w-12"
                                    defaultValue={pretirement}
                                    onChange={e => setpretirement(Math.min(100, Math.max(0, e.target.valueAsNumber)))}
                                    type="number">
            </input>% {formatter.format(takehomemoney * (pretirement / 100))}
            </label>
            <label className="mt-2">
                Leisure: <input name="pleisure" className="w-12"
                                   defaultValue={pleisure}
                                   onChange={e => setpleisure(Math.min(100, Math.max(0, e.target.valueAsNumber)))}
                                   type="number">
            </input>% {formatter.format(takehomemoney * (pleisure/ 100))}
            </label>
            <label className="mt-2">
                Savings: {100 - pinvestments - pretirement - pleisure}% {formatter.format(takehomemoney * ((100 - pinvestments - pretirement - pleisure) / 100))}
            </label>
        </div>]
    return (
        <>
            {pages[page]}
                <div className="flex flex-col absolute bottom-0 w-full g-4 mb-2">
                    <h2>{fname} {lname}</h2>
                    <h3 className="text-yellow-600">Bank Account: {formatter.format(balance)}</h3>
                </div>

        </>
    );
}

export default GamePage