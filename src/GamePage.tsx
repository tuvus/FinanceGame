/* eslint-disable react-hooks/immutability */
import './App.css'
import random from "random";
import {useEffect, useState} from "react";
import {LineChart} from "./components/LineChart.tsx";
import Select from 'react-select';
import {Account, Character, Loan, StockAccount, StockBond} from "./Data.tsx";
import StockCard from "./components/StockCard.tsx";
import {CalculateTaxes, GetDateString} from "./Utils.tsx";
import {DonutChart} from "./components/DonutChart.tsx";
import {LifeEvent, LifeEventManager} from "./EventManager.tsx";

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
    const [date] = useState({d: new Date(random.int(1940, 2010), 0)});
    const [savingsAccount] = useState({a: new Account("Savings Account", 0, new Date(date.d.getFullYear() - 1, 0), true)});
    const [page, setPage] = useState(999);
    const [character] = useState(new Character(fname, lname, date.d));
    const [pinvestments, setpinvestments] = useState(2);
    const [pretirement, setpretirement] = useState(3);
    const [pleisure, setpleisure] = useState(10);
    const [investmentAccount] = useState({a: new StockAccount("Investment Account", 0, new Date(date.d.getFullYear() - 1, 0))});
    const [retirementAccount] = useState({a: new StockAccount("Retirement Account", 0, new Date(date.d.getFullYear() - 1, 0))});
    const [indexFund] = useState({a: new StockBond("Index Fund", random.int(7000, 50000) / 100, new Date(date.d.getFullYear() - 1, 0), false)});
    const [bond] = useState({a: new StockBond("Bond", 1, new Date(date.d.getFullYear() - 1, 0), true)});
    const [rerender, setRerender] = useState(0);
    const render = () => {
        // eslint-disable-next-line react-hooks/purity
        setRerender(Math.random() + rerender)
    };
    const [transferFrom, setTransferFrom] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [transferTo, setTransferTo] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [fundsToTransfer, setFundsToTransfer] = useState(0);
    const [inflation, setInflation] = useState(1);

    const monthlyItemizedLivingExpenses = [
        {name: "Rent", amount: 1650},
        {name: "Utilities", amount: 410},
        {name: "Internet", amount: 40},
        {name: "Phone Data", amount: 60},
        {name: "Groceries", amount: 150},
        {name: "Car Gas", amount: 110},
        {name: "Car Maintenance", amount: 70},
        {name: "Car Insurance", amount: 236},
        {name: "Health Insurance", amount: 400},
    ];

    const previousPage = () => {
        if (page != 0) setPage(page - 1);
    }

    const nextPage = () => {
        if (page + 1 == pages.length - 1) {
            if (lifeEventManager.lifeEvents.length == 0) {
                lifeEventManager.AddEvent(
                    new LifeEvent("Another year passes", date.d,
                        (<div><p>There were no special events this year.</p></div>))
                );
            }
        }
        setPage(page + 1);
    }

    const endYear = () => {
        const livingExpenses = monthlyItemizedLivingExpenses.map(e => e.amount).reduce((sum, curr) => sum + curr, 0) * inflation * 12;

        const newSavings = character.salary * (100 - pinvestments - pretirement - pleisure) / 100 - CalculateTaxes(Math.max(0, character.salary * (1 - pretirement / 100) - 15750)) - livingExpenses;
        // Income and interest
        savingsAccount.a.balance += newSavings;
        investmentAccount.a.balance += character.salary * pinvestments / 100
        retirementAccount.a.balance += character.salary * pretirement / 100
        indexFund.a.balance *= random.float(.85, 1.2);

        // Inflation
        const newInflation = random.float(1.01, 1.04);
        setInflation(inflation * newInflation);
        indexFund.a.balance *= newInflation;
        bond.a.balance *= 1.052;

        // History log
        indexFund.a.endYear(date.d);
        bond.a.endYear(date.d);
        character.endYear(date.d, newInflation);

        date.d.setFullYear(date.d.getFullYear() + 1);
        setPage(0);
    }

    const taxes = CalculateTaxes(Math.max(0, character.salary * (1 - pretirement / 100) - 15750));

    const monthlyLivingExpenses = monthlyItemizedLivingExpenses.map(e => e.amount).reduce((sum, curr) => sum + curr, 0) * inflation;
    const livingExpenses = monthlyLivingExpenses * 12;

    const newSavings = character.salary * (100 - pinvestments - pretirement - pleisure) / 100 - taxes - livingExpenses;
    const ploans = character.loans.reduce((sum, l) => sum + l.getPayment(), 0) / character.salary * 100;

    useEffect(() => {
        character.accounts = [savingsAccount.a, investmentAccount.a, retirementAccount.a];
    }, [])

    const [lifeEventManager] = useState(new LifeEventManager(date.d, endYear, render, [
        new LifeEvent("Education", date.d, <>
            <h2>Choose your education path</h2>
            <div className="flex justify-center gap-8 mt-6">
                <div className="eventButton panelButton"
                     onClick={() => {
                         character.salary = 48000 * random.float(.95, 1.1);
                         savingsAccount.a.balance = 30000 * random.float(.7, 1.3);
                         lifeEventManager.NextEvent();
                     }}>
                    <h3 className="text-gray-700 font-bold">High School</h3>
                    <p className="text-gray-700">High school graduates that go straight into the workforce start making
                        money earlier and can start building their wealth.</p>
                </div>
                <div className="eventButton panelButton"
                     onClick={() => {
                         character.salary = 53000 * random.float(.95, 1.3);
                         savingsAccount.a.balance = 8000 * random.float(.7, 1.3);
                         lifeEventManager.NextEvent();
                     }}>
                    <h3 className="text-gray-700 font-bold">Trade School</h3>
                    <p className="text-gray-700">The experience from a trade school certificate helps entry into more
                        specialized work areas. This is a two year program, balancing education and going into the
                        workforce early.</p>
                </div>
                <div className="eventButton panelButton"
                     onClick={() => {
                         lifeEventManager.ReplaceEvent(new LifeEvent("Choosing a College", date.d, <>
                             <div className="flex justify-center gap-8">
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          character.salary = 57000 * random.float(.90, 1.3);
                                          savingsAccount.a.balance = 2000 * random.float(.7, 1.3);
                                          character.addLoan(new Loan("College", 12000 * random.float(.7, 1.3), date.d, savingsAccount.a, 1.02));
                                          lifeEventManager.NextEvent();
                                      }}>
                                     <h3 className="text-gray-700 font-bold">Community College</h3>
                                     <p className="text-gray-700">Obtain an associates degree</p>
                                     <p className="text-gray-700">Cheaper than other colleges</p>
                                 </div>
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          character.salary = 80000 * random.float(.85, 1.3);
                                          savingsAccount.a.balance = 1000 * random.float(.7, 1.3);
                                          character.addLoan(new Loan("College", 34000 * random.float(.7, 1.3), date.d, savingsAccount.a, 1.02));
                                          lifeEventManager.NextEvent();
                                      }}>
                                     <h3 className="text-gray-700 font-bold">Public University</h3>
                                     <p className="text-gray-700">Obtain a bachelors degree</p>
                                     <p className="text-gray-700">Moderately expensive</p>
                                 </div>
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          character.salary = 83000 * random.float(.80, 1.2);
                                          savingsAccount.a.balance = 4000 * random.float(.7, 1.3);
                                          character.addLoan(new Loan("College", 47000 * random.float(.7, 1.3), date.d, savingsAccount.a, 1.02));
                                          lifeEventManager.NextEvent();
                                      }}>
                                     <h3 className="text-gray-700 font-bold">Private University</h3>
                                     <p className="text-gray-700">Obtain a bachelors degree</p>
                                     <p className="text-gray-700">Very expensive</p>
                                 </div>
                             </div>
                         </>, true));
                     }}>
                    <h3 className="text-gray-700 font-bold">College</h3>
                    <p className="text-gray-700">Obtained a bachelors degree</p>
                    <p className="text-gray-700">Can be expensive</p>
                </div>
            </div>
        </>, true),
        new LifeEvent("Moving Out", date.d, <>
            <h2>Its time to start your journey!</h2>
            <button className="w-50 text-xl h-10 p-1 font-bold mt-2" onClick={() => {
                lifeEventManager.RemoveFirstEvent()
                date.d.setFullYear(date.d.getFullYear() + 1);
                setPage(0);
            }}><h3>Start!</h3></button>
        </>, true),
        new LifeEvent("Event Tutorial", new Date(date.d.getFullYear() + 1, 5),
            (<div><p>During the year you will encounter events that may have a financial impact.</p></div>)),
    ]));
    const activeEvent = lifeEventManager.GetActiveEvent(date.d);

    const pages = [
        <div className="flex flex-col gap-2 items-center">
            <h1>Year in review {date.d.getFullYear() - 1}</h1>
            <div className="grid grid-cols-2">
                {character.accounts.map((account, i) => (
                    <div key={i} className="flex flex-col items-center bg-amber-100 rounded-xl p-4 m-4 gap-1">
                        <h3 className="text-gray-700 font-bold">{account.name}</h3>
                        <div className="flex items-baseline gap-2">
                            <p className="text-gray-700">{formatter.format(account.getTotalValue())}</p>
                            {account.diff ? account.diff >= 0 ? (<p className="text-green-700">+{account.diff}%</p>)
                                : <p className="text-red-800">{account.diff}%</p> : <></>}
                        </div>
                        <LineChart className="h-40 w-120"
                                   data={account.history}
                                   index="dateString"
                                   showLegend={false}
                                   minValue={Math.min(0, Math.min(...account.history.map(h => h.balance)))}
                                   maxValue={Math.max(...account.history.map(h => h.balance))}
                                   aria-hidden="true"
                                   categories={["balance"]}
                                   valueFormatter={(number: number) => compactFormatter.format(number)}/>
                    </div>))}
                <DonutChart className="h-full w-full m-auto p-4"
                            data={[
                                {name: "Cash", amount: character.accounts.reduce((sum, curr) => sum + curr.balance, 0)},
                                {
                                    name: "Stocks",
                                    amount: character.accounts.filter(a => a instanceof StockAccount).map(a => a as StockAccount)
                                        .reduce((sum, curr) => sum + curr.getStockValue(), 0)
                                }, {
                                    name: "Bonds",
                                    amount: character.accounts.filter(a => a instanceof StockAccount).map(a => a as StockAccount)
                                        .reduce((sum, curr) => sum + curr.getBondValue(), 0)
                                }, {
                                    name: "Loans",
                                    amount: character.totalLoans.getTotalValue()
                                }
                            ]}
                            label={"Total Assets: " + formatter.format(character.accounts.reduce((sum, curr) => sum + curr.getTotalValue(), 0))}
                            category="name" value="amount" showLabel={true}
                            valueFormatter={(number: number) => formatter.format(number)}/>
            </div>
            <div className="flex gap-2 justify-center">
                <button className="w-60 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>Next: Paycheck</h3>
                </button>
            </div>
        </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Allocation</h1>
            <div className="grid grid-cols-3 w-1/2">
                <p className="text-green-700">Paycheck</p>
                <p></p>
                <p className="text-green-700">{formatter.format(character.salary)}</p>
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
                <p>{formatter.format(character.salary * pretirement / 100)}</p>


                <p className="text-red-800">Taxes</p>
                <p className="text-red-800">{Math.round(taxes / character.salary * 100)}%</p>
                <p className="text-red-800">{formatter.format(taxes)}</p>

                {monthlyItemizedLivingExpenses.map(({name, amount}, i) => {
                    return ([
                        <p className="text-red-800" key={i + "1"}>{name}</p>,
                        <p className="text-red-800"
                           key={i + "2"}>{Math.round(amount * 12 * inflation / character.salary * 100)}%</p>,
                        <p className="text-red-800" key={i + "3"}>{formatter.format(amount * inflation * 12)}</p>
                    ]);
                })}

                {character.loans.length > 0 ? [
                    <p className="text-red-800">Loans</p>,
                    <p className="text-red-800">{Math.round(ploans)}%</p>,
                    <p className="text-red-800">{formatter.format(character.loans.reduce((sum, l) => sum + l.getPayment(), 0))}</p>
                ] : []}

                <p>Investments</p>
                <p><input name="pinvestments" className="w-12"
                          min="0"
                          defaultValue={pinvestments}
                          onChange={e => setpinvestments(Math.min(1000, Math.max(0, e.target.valueAsNumber)))}
                          type="number">
                </input>%</p>
                <p>{formatter.format(character.salary * pinvestments / 100)}</p>

                <p>Leisure</p>
                <p><input name="pleisure" className="w-12"
                          min="0"
                          defaultValue={pleisure}
                          onChange={e => setpleisure(Math.min(1000, Math.max(0, e.target.valueAsNumber)))}
                          type="number">
                </input>%</p>
                <p>{formatter.format(character.salary * pleisure / 100)}</p>

                <hr/>
                <hr/>
                <hr/>

                <p className="text-yellow-600">Savings</p>
                <p className="text-yellow-600">{Math.round(newSavings / character.salary * 100)}%</p>
                <p className="text-yellow-600">{formatter.format(newSavings)}</p>
            </div>

            <div className="flex gap-2">
                <h3 className={newSavings > 0 ? "text-green-700" : "text-red-800"}>
                    Predicted Balance: {formatter.format(savingsAccount.a.balance + newSavings)}</h3>
            </div>
            <div className="flex gap-2 justify-center">
                <button className="w-24 text-xl h-10 p-1 font-bold" onClick={() => previousPage()}><h3>Back</h3>
                </button>
                <button className="w-60 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>Next:
                    Investments</h3>
                </button>
            </div>
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
            <div className="flex gap-2 justify-center">
                <button className="w-24 text-xl h-10 p-1 font-bold" onClick={() => previousPage()}><h3>Back</h3>
                </button>
                <button className="w-60 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>Next: Retirement</h3>
                </button>
            </div>
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
            <div className="flex gap-2 justify-center">
                <button className="w-24 text-xl h-10 p-1 font-bold" onClick={() => previousPage()}><h3>Back</h3>
                </button>
                <button className="w-50 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>Start the year</h3>
                </button>
            </div>
        </div>,
        <div>
            {activeEvent == null ?
                <>
                    <h1>Events</h1>
                    <button className="w-50 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>End of year</h3>
                    </button>
                </>
                : <>
                    <h1 className="mb-2">{activeEvent.name}</h1>
                    {activeEvent.element}
                    {!activeEvent.customContinue ?
                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                onClick={() => lifeEventManager.NextEvent()}>
                            <h3>Continue</h3>
                        </button> : <></>}
                </>
            }
        </div>
    ];
    return (
        <div>
            {pages[Math.min(page, pages.length - 1)]}
            <div id="transfer-modal" className="flex hmodal justify-center">
                <div
                    className="flex flex-col gap-2 ml-auto mr-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4">
                    <h3 className="text-gray-700">Transfer Funds</h3>
                    <Select options={character.accounts.filter(a => a.isOwnedAccount)}
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
                    <Select
                        options={character.accounts.filter(a => a != transferFrom.selectedAccount && a.isOwnedAccount)}
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
            <div className="mb-20"></div>
            <div className="fixed bottom-0 left-0 z-50 h-16 right-0 justify-center w-full p-2 rounded-4xl bg-gray-900">
                <div className="grid grid-cols-4 content-center align-items-middle mx-auto h-full ml-4 mr-4">
                    <h2 className="justify-self-start align-self-middle">{fname} {lname}</h2>
                    <h3 className="text-yellow-600 justify-self-end">Bank
                        Account: {formatter.format(savingsAccount.a.balance)}</h3>
                    <button className="w-40 ml-4 text-lg h-8 justify-self-left"
                            onClick={() => {
                                setFundsToTransfer(0);
                                setTransferFrom({selectedAccount: null});
                                setTransferTo({selectedAccount: null});
                                document.getElementById("transfer-modal")!.style.display = "block";
                            }}>Transfer
                        Money
                    </button>
                    <p className="justify-self-end">{GetDateString(date.d)}</p>
                </div>
            </div>
        </div>
    );
}

export default GamePage