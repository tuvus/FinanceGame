/* eslint-disable react-hooks/immutability */
import './App.css'
import random from "random";
import {useState} from "react";
import {LineChart} from "./components/LineChart.tsx";
import Select from 'react-select';

type GameProps = {
    fname: string; lname: string;
}

class Account {
    name: string;
    balance: number;
    diff: number | undefined;
    history: { date: number, balance: number }[];
    isOwnedAccount: boolean;

    constructor(name: string, balance: number, date: number, isOwnedAccount: boolean) {
        this.name = name;
        this.balance = balance;
        this.diff = undefined;
        this.history = [{date: date, balance: balance}];
        this.isOwnedAccount = isOwnedAccount;
    }

    endYear(date: number): void {
        this.history = [...this.history, {date: date, balance: this.balance}];
        this.diff = Math.floor((this.history[this.history.length - 1].balance - this.history[this.history.length - 2].balance) / Math.abs(this.history[this.history.length - 2].balance) * 100);
    }
}

class Stock extends Account {
    shares: number;

    constructor(name: string, balance: number, date: number) {
        super(name, balance, date, false);
        this.shares = 0;
    }

    getValue(): number {
        return this.shares * this.balance;
    }
}

interface TransferFundsSelectState {
    selectedAccount: Account | null;
}

function GamePage({fname, lname}: GameProps) {
    const formatter = new Intl.NumberFormat("en", {style: "currency", currency: "USD", maximumFractionDigits: 2});
    const compactFormatter = new Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        compactDisplay: "short"
    });
    const [year, setYear] = useState(random.int(1940, 2010));
    const [savingsAccount] = useState({a: new Account("Savings Account", random.float(10000, 30000), year, true)});
    const [page, setPage] = useState(0);
    const [salary] = useState(59999);
    const [pinvestments, setpinvestments] = useState(10);
    const [pretirement, setpretirement] = useState(5);
    const [pleisure, setpleisure] = useState(40);
    const [investmentAccount] = useState({a: new Account("Investment Account", 0, year, true)});
    const [investmentPortfolio] = useState({a: new Account("Investments", 0, year, false)});
    const [indexFund] = useState({a: new Stock("Index Fund", random.int(7000, 50000) / 100, year)})
    const [allAccounts] = useState([savingsAccount.a, investmentAccount.a, investmentPortfolio.a]);
    const [rerender, setRerender] = useState(false);
    const render = () => {
        setRerender(!rerender)
    };
    const [transferFrom, setTransferFrom] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [transferTo, setTransferTo] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [fundsToTransfer, setFundsToTransfer] = useState(0)
    const [stocksToBuySell, setStocksToBuySellSell] = useState(0)
    const [buySellConfirm, setBuySellConfirm] = useState({
        func: (amount: number) => {
            console.log(amount.toString())
        }
    })
    const [stockBuySellText, setStockBuySellText] = useState("Buy")


    const taxes = salary * .32;
    const livingExpenses = 32000;

    const takehomemoney = salary - taxes - livingExpenses;
    const newSavings = takehomemoney * ((100 - pinvestments - pretirement - pleisure) / 100);

    const pages = [
        <div className="flex flex-col gap-2 items-center">
            <h1>Year in review {year - 1}</h1>
            <div className="grid grid-cols-2">
                {allAccounts.filter(a => a.isOwnedAccount).map((account, i) => (
                    <div key={i} className="flex flex-col items-center bg-amber-100 rounded-xl p-4 m-4 gap-1">
                        <h3 className="text-gray-700 font-bold">{account.name}</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-gray-700">{formatter.format(account.balance)}</p>
                            {account.diff ? account.diff >= 0 ? (<p className="text-green-700">+{account.diff}%</p>)
                                : <p className="text-red-800">{account.diff}%</p> : <></>}
                        </div>
                        <LineChart className="h-40 w-120" data={account.history}
                                   index="date"
                                   showLegend={false}
                                   minValue={Math.min(...account.history.map(h => h.balance))}
                                   maxValue={Math.max(...account.history.map(h => h.balance))}
                                   aria-hidden="true"
                                   categories={["balance"]}
                                   valueFormatter={(number: number) => compactFormatter.format(number)}/>
                    </div>))}
            </div>
            <button className="w-80 text-xl h-10 font-bold" onClick={() => setPage(page + 1)}><h3>Next: Paycheck</h3>
            </button>
        </div>,
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
                <div className="flex items-baseline gap-2">
                    <p className="text-gray-700">{formatter.format(indexFund.a.balance)}</p>
                    {indexFund.a.diff ? indexFund.a.diff >= 0 ? (<p className="text-green-700">+{indexFund.a.diff}%</p>)
                        : <p className="text-red-800">{indexFund.a.diff}%</p> : <></>}
                    <p className="text-gray-700">per share</p>
                </div>

                <p className="text-gray-700">
                    Shares: {Math.round(indexFund.a.shares * 100) / 100} ({formatter.format(indexFund.a.getValue())})
                </p>
                <div className="flex gap-2">
                    <button className="w-40 text-xl h-10 font-bold" onClick={() => {
                        setStocksToBuySellSell(Math.floor(investmentAccount.a.balance * 100 / indexFund.a.balance) / 100);
                        setBuySellConfirm({func: (amount: number) => {
                            amount = Math.min(amount, investmentAccount.a.balance / indexFund.a.balance);
                            if (amount.valueOf() <= 0 || isNaN(amount)) return;
                            indexFund.a.shares += amount;
                            investmentAccount.a.balance -= amount * indexFund.a.balance;
                            render();
                        }});
                        setStockBuySellText("Buy");
                        document.getElementById("buy-stock-modal")!.style.display = "block";
                    }}><h3>Buy</h3></button>
                    {indexFund.a.shares > 0 ? <button className="w-40 text-xl h-10 font-bold" onClick={() => {
                        setStocksToBuySellSell(Math.floor(indexFund.a.shares * 100) / 100);
                        setBuySellConfirm({func: (amount: number) => {
                                amount = Math.min(amount, indexFund.a.shares);
                                if (amount.valueOf() <= 0 || isNaN(amount)) return;
                                indexFund.a.shares -= amount;
                                investmentAccount.a.balance += amount * indexFund.a.balance;
                                render();
                            }});
                        setStockBuySellText("Sell");
                        document.getElementById("buy-stock-modal")!.style.display = "block";
                    }}><h3>Sell</h3></button> : <></>}
                </div>
                <LineChart className="h-60 w-120" data={indexFund.a.history}
                           index="date"
                           showLegend={false}
                           minValue={Math.min(...indexFund.a.history.map(h => h.balance))}
                           maxValue={Math.max(...indexFund.a.history.map(h => h.balance))}
                           aria-hidden="true"
                           categories={["balance"]}
                           valueFormatter={(number: number) => compactFormatter.format(number)}/>
            </div>
            <button className="w-80 text-xl h-10 font-bold" onClick={() => {
                setPage(0);
                setYear(year + 1);
                indexFund.a.balance *= random.float(.85, 1.2);
                indexFund.a.endYear(year);
                investmentPortfolio.a.balance = investmentAccount.a.balance + indexFund.a.getValue();
                allAccounts.forEach((account) => account.endYear(year));
            }}><h3>Next year</h3></button>
        </div>
    ];
    return (
        <>
            {pages[page]}
            <div id="buy-stock-modal" className="flex modal justify-center">
                <div
                    className="flex flex-col gap-2 ml-auto mr-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4">
                    <h3 className="text-gray-700">How many Shares would you like to {stockBuySellText.toLowerCase()}?</h3>
                    <div className="flex">
                        <p className="text-xl text-gray-700! p-2">$</p>
                        <input name="buy-shares" className="w-80 bg-white rounded-xl p-1 text-gray-700"
                               min={0}
                               max={investmentAccount.a.balance / indexFund.a.balance}
                               value={stocksToBuySell}
                               type="number">
                        </input>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => document.getElementById("buy-stock-modal")!.style.display = "none"}
                            className="p-2 w-25">Cancel
                        </button>
                        <button
                            onClick={() => {
                                buySellConfirm.func(stocksToBuySell);
                                document.getElementById("buy-stock-modal")!.style.display = "none";
                            }}
                            className="p-2 w-25 bg-green-700!">{stockBuySellText}
                        </button>
                    </div>
                </div>
            </div>
            <div id="transfer-modal" className="flex modal justify-center">
                <div
                    className="flex flex-col gap-2 ml-auto mr-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4">
                    <h3 className="text-gray-700">Transfer Funds</h3>
                    <Select options={allAccounts.filter(a => a.isOwnedAccount)}
                            getOptionLabel={a => a.name}
                            value={transferFrom.selectedAccount}
                            isSearchable={false}
                            onChange={(a: Account | null) => {
                                let to = transferTo.selectedAccount;
                                if (a == to) to = transferFrom.selectedAccount;
                                setTransferFrom({selectedAccount: a});
                                setTransferTo({selectedAccount: to});
                            }}></Select>
                    {transferFrom.selectedAccount ?
                        <p className="text-gray-700 text-lg!">Balance: {formatter.format(transferFrom.selectedAccount!.balance)}</p> : <></>}
                    <Select options={allAccounts.filter(a => a != transferFrom.selectedAccount && a.isOwnedAccount)}
                            getOptionLabel={a => a.name}
                            value={transferTo.selectedAccount}
                            isSearchable={false}
                            onChange={(a: Account | null) => setTransferTo({selectedAccount: a})}></Select>

                    <div className="flex">
                        <p className="text-xl text-gray-700! p-2">$</p>
                        <input name="transfer-funds" className="w-80 bg-white rounded-xl p-1 text-gray-700"
                               min={0}
                               max={transferFrom.selectedAccount?.balance ?? 0}
                               disabled={transferFrom.selectedAccount == null}
                               value={fundsToTransfer}
                               onChange={e => setFundsToTransfer(e.target.valueAsNumber)}
                               type="number">
                        </input>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => document.getElementById("transfer-modal")!.style.display = "none"}
                            className="p-2 w-25">Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (transferFrom.selectedAccount != null && transferTo.selectedAccount != null && transferFrom.selectedAccount != transferTo.selectedAccount) {
                                    const toTransfer = Math.min(fundsToTransfer, transferFrom.selectedAccount.balance);
                                    transferFrom.selectedAccount.balance -= toTransfer;
                                    transferTo.selectedAccount.balance += toTransfer;
                                }
                                document.getElementById("transfer-modal")!.style.display = "none";
                            }}
                            className="p-2 w-25 bg-green-700!">Transfer
                        </button>
                    </div>
                </div>
            </div>
            <div className="absolute flex bottom-0 g-4 justify-center w-full mb-3">
                <h3 className="text-yellow-600">Bank Account: {formatter.format(savingsAccount.a.balance)}
                </h3>
                <button className="w-40 ml-4 text-lg h-8"
                        onClick={() => {
                            setFundsToTransfer(0);
                            setTransferFrom({selectedAccount: null});
                            setTransferTo({selectedAccount: null});
                            document.getElementById("transfer-modal")!.style.display = "block";
                        }}>Transfer
                    Money
                </button>
            </div>
            <h2 className="absolute bottom-2 left-10">{fname} {lname}</h2>
            <p className="absolute bottom-4 right-10">{year}</p>

        </>
    );
}

export default GamePage