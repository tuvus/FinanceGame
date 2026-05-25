/* eslint-disable react-hooks/immutability */
import './App.css'
import random from "random";
import {useState} from "react";
import {LineChart} from "./components/LineChart.tsx";
import Select from 'react-select';
import {Account, StockAccount, StockBond} from "./Data.tsx";
import StockCard from "./components/StockCard.tsx";

type GameProps = {
    fname: string; lname: string;
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
    const [savingsAccount] = useState({a: new Account("Savings Account", random.float(10000, 30000), year - 1, true)});
    const [page, setPage] = useState(0);
    const [salary, setSalary] = useState(60000);
    const [pinvestments, setpinvestments] = useState(2);
    const [pretirement, setpretirement] = useState(3);
    const [pleisure, setpleisure] = useState(5);
    const [investmentAccount] = useState({a: new StockAccount("Investment Account", 0, year - 1)});
    const [retirementAccount] = useState({a: new StockAccount("Retirement Account", 0, year - 1)});
    const [indexFund] = useState({a: new StockBond("Index Fund", random.int(7000, 50000) / 100, year - 1, false)});
    const [bond] = useState({a: new StockBond("Bond", 1, year - 1, true)});
    const [allAccounts] = useState([savingsAccount.a, investmentAccount.a, retirementAccount.a]);
    const [rerender, setRerender] = useState(false);
    const render = () => {
        setRerender(!rerender)
    };
    const [transferFrom, setTransferFrom] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [transferTo, setTransferTo] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [fundsToTransfer, setFundsToTransfer] = useState(0)
    const [inflation, setInflation] = useState(1)


    const taxes = (salary - (salary * pretirement / 100)) * .32;
    const livingExpenses = 32000 * inflation;

    const newSavings = salary * (100 - pinvestments - pretirement - pleisure) / 100 - taxes - livingExpenses;

    const nextPage = () => {
        setPage(page + 1);
        if (page >= pages.length - 1) endYear();
    }

    const endYear = () => {
        // Income and interest
        savingsAccount.a.balance += newSavings;
        investmentAccount.a.balance += salary * pinvestments / 100
        retirementAccount.a.balance += salary * pretirement / 100
        indexFund.a.balance *= random.float(.85, 1.2);

        // Inflation
        const newInflation = random.float(1.01, 1.03);
        setInflation(inflation * newInflation);
        setSalary(salary * newInflation);
        indexFund.a.balance *= newInflation;
        bond.a.balance *= 1.022;

        setPage(0);
        setYear(year + 1);

        // History log
        indexFund.a.endYear(year);
        bond.a.endYear(year);
        allAccounts.forEach((account) => account.endYear(year));
    };



    const pages = [
        <div className="flex flex-col gap-2 items-center">
            <h1>Year in review {year - 1}</h1>
            <div className="grid grid-cols-2">
                {allAccounts.map((account, i) => (
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
            <button className="w-80 text-xl h-10 font-bold" onClick={() => nextPage()}><h3>Next: Paycheck</h3>
            </button>
        </div>,
        // <div className="flex flex-col gap-2 items-center">
        //     <h1>Payday!</h1>
        //     <p className="text-yellow-600">{formatter.format(salary)} paycheck</p>
        //     <p className="text-red-800">-{formatter.format(taxes)} taxes</p>
        //     <p className="text-red-800">-{formatter.format(livingExpenses)} living expenses</p>
        //     <br/>
        //     <p className="text-green-700">= {formatter.format(0)} take home</p>
        //     <button className="w-80 text-xl h-10 font-bold" onClick={() => setPage(page + 1)}><h3>Next: Allocating
        //         money</h3></button>
        // </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Allocation</h1>
            <div className="grid grid-cols-3 w-1/3">
                <p className="text-green-700">Paycheck</p>
                <p></p>
                <p className="text-green-700">{formatter.format(salary)}</p>
                <hr></hr>
                <hr></hr>
                <hr></hr>

                <p>Retirement</p>
                <p><input name="pretirement" className="w-12"
                          min="0"
                          defaultValue={pretirement}
                          onChange={e => setpretirement(Math.min(1000, Math.max(0, e.target.valueAsNumber)))}
                          type="number">
                </input>%</p>
                <p>{formatter.format(salary * pretirement / 100)}</p>


                <p className="text-red-800">Taxes</p>
                <p className="text-red-800">{Math.round(taxes / salary * 100)}%</p>
                <p className="text-red-800">{formatter.format(taxes)}</p>


                <p className="text-red-800">Living Expenses</p>
                <p className="text-red-800">{Math.round(livingExpenses / salary * 100)}%</p>
                <p className="text-red-800">{formatter.format(livingExpenses)}</p>

                <p>Investments</p>
                <p><input name="pinvestments" className="w-12"
                          min="0"
                          defaultValue={pinvestments}
                          onChange={e => setpinvestments(Math.min(1000, Math.max(0, e.target.valueAsNumber)))}
                          type="number">
                </input>%</p>
                <p>{formatter.format(salary * pinvestments / 100)}</p>

                <p>Leisure</p>
                <p><input name="pleisure" className="w-12"
                          min="0"
                          defaultValue={pleisure}
                          onChange={e => setpleisure(Math.min(1000, Math.max(0, e.target.valueAsNumber)))}
                          type="number">
                </input>%</p>
                <p>{formatter.format(salary * pleisure / 100)}</p>

                <p className="text-yellow-600">Savings</p>
                <p className="text-yellow-600">{Math.round(newSavings / salary * 100)}%</p>
                <p className="text-yellow-600">{formatter.format(newSavings)}</p>
            </div>

            <div className="flex gap-2">
                <h3 className={newSavings > 0 ? "text-green-700" : "text-red-800"}>
                    New Balance: {formatter.format(savingsAccount.a.balance + newSavings)}</h3>
            </div>
            <button className="w-80 text-xl h-10 font-bold" onClick={() => nextPage()}><h3>Next: Investments</h3>
            </button>
        </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Investment Portfolio</h1>
            <p className="mt-2 text-yellow-600">
                Uninvested: {formatter.format(investmentAccount.a.balance)}
            </p>
            <StockCard stock={indexFund} investmentAccount={investmentAccount} formatter={formatter}
                       compactFormatter={compactFormatter} render={render}/>
            <StockCard stock={bond} investmentAccount={investmentAccount} formatter={formatter}
                       compactFormatter={compactFormatter} render={render}/>
            <button className="w-80 text-xl h-10 font-bold" onClick={() => nextPage()}><h3>Next: Retirement</h3>
            </button>
        </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Retirement Portfolio</h1>
            <p className="mt-2 text-yellow-600">
                Uninvested: {formatter.format(retirementAccount.a.balance)}
            </p>
            <StockCard stock={indexFund} investmentAccount={retirementAccount} formatter={formatter}
                       compactFormatter={compactFormatter} render={render}/>
            <StockCard stock={bond} investmentAccount={retirementAccount} formatter={formatter}
                       compactFormatter={compactFormatter} render={render}/>
            <button className="w-80 text-xl h-10 font-bold" onClick={() => nextPage()}><h3>Next year</h3></button>
        </div>
    ];
    return (
        <>
            {pages[page]}
            <div id="transfer-modal" className="flex hmodal justify-center">
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
                               min=""
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
                            disabled={transferFrom.selectedAccount == null || transferTo.selectedAccount == null}
                            onClick={() => {
                                if (transferFrom.selectedAccount != null && transferTo.selectedAccount != null && transferFrom.selectedAccount != transferTo.selectedAccount) {
                                    const toTransfer = Math.min(fundsToTransfer, transferFrom.selectedAccount.balance);
                                    transferFrom.selectedAccount.balance -= toTransfer;
                                    transferTo.selectedAccount.balance += toTransfer;
                                    render();
                                }
                                document.getElementById("transfer-modal")!.style.display = "none";
                            }}
                            className="p-2 w-25 enabled:bg-green-700! disabled:bg-gray-400!">Transfer
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