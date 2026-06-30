/* eslint-disable react-hooks/immutability */
import './App.css'
import random from "random";
import {useEffect, useRef, useState} from "react";
import {LineChart} from "./components/LineChart.tsx";
import Select from 'react-select';
import {Account, Character, GameState, Loan, StockAccount, StockBond} from "./Data.tsx";
import StockCard from "./components/StockCard.tsx";
import {CalculateTaxes, GetDateString} from "./Utils.tsx";
import {DonutChart} from "./components/DonutChart.tsx";
import {LifeEvent, LifeEventManager} from "./EventManager.tsx";
import {TutorialChain, TutorialEvent, TutorialManager} from "./TutorialManager.tsx";
import DayTrading from "./events/DayTrading.tsx";

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
    const [page, setPage] = useState(999);
    const [character] = useState(new Character(fname, lname, [
        {name: "Rent", amount: 1650},
        {name: "Utilities", amount: 410},
        {name: "Internet", amount: 40},
        {name: "Phone Data", amount: 60},
        {name: "Groceries", amount: 150},
        {name: "Car Gas", amount: 110},
        {name: "Car Maintenance", amount: 70},
        {name: "Car Insurance", amount: 236},
        {name: "Health Insurance", amount: 400},
    ], 17));
    const [gameState] = useState({s: new GameState(new Date(random.int(1940, 2010), 0), character, formatter, compactFormatter)});
    const [indexFund] = useState({a: new StockBond("Index Fund", random.int(7000, 50000) / 100, false)});
    const [bond] = useState({a: new StockBond("Bond", 1, true)});
    const [rerender, setRerender] = useState(0);
    const render = () => {
        // eslint-disable-next-line react-hooks/purity
        setRerender(Math.random() + rerender)
    };
    const [transferFrom, setTransferFrom] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [transferTo, setTransferTo] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [fundsToTransfer, setFundsToTransfer] = useState(0);
    const [inflation, setInflation] = useState(1);


    const previousPage = () => {
        if (page == 3 && character.loans.length == 0) setPage(page - 2);
        else if (page != 0) setPage(page - 1);
    }

    const nextPage = () => {
        if (page + 1 == pages.length - 1) {
            if (!lifeEventManager.GetActiveEvent(gameState.s.date)) {
                lifeEventManager.AddEvent(
                    new LifeEvent("Another year passes", gameState.s.date,
                        (<div><h3 className="m-4">There were no special events this year.</h3></div>))
                );
            }
        }
        if (page == 1 && character.loans.length == 0) {
            setPage(page + 2);
        } else {
            setPage(page + 1);
        }
    }

    const endYear = () => {
        const livingExpenses = character.monthlyLivingExpenses.map(e => e.amount).reduce((sum, curr) => sum + curr, 0) * inflation * 12;
        const taxableIncome = Math.max(0, character.salary * (1 - character.pretirement / 100) - 15750);
        character.taxableIncome = taxableIncome;
        const taxes = CalculateTaxes(taxableIncome);
        const newSavings = character.salary * (100 - character.pinvestments - character.pretirement - character.pleisure) / 100 - taxes - livingExpenses - character.loans.reduce((sum, l) => sum + l.getPayment(), 0);

        // Go on trips!
        character.satisfaction += (character.loans.length > 0 ? 5 : 8) + character.satisfaction * character.pleisure / 100 / inflation;

        // Income and interest
        character.savingsAccount.balance += newSavings;
        if (character.savingsAccount.balance < 0) {
            character.addCreditDebt(-character.savingsAccount.balance)
            character.savingsAccount.balance = 0;
        }
        character.investmentAccount.balance += character.salary * character.pinvestments / 100
        character.retirementAccount.balance += character.salary * character.pretirement / 100
        indexFund.a.balance *= random.float(.85, 1.2);

        // Inflation
        const newInflation = random.float(1.01, 1.04);
        setInflation(inflation * newInflation);
        indexFund.a.balance *= newInflation;
        bond.a.balance *= 1.052;

        // History log
        indexFund.a.endYear(gameState.s.date);
        bond.a.endYear(gameState.s.date);
        character.endYear(gameState.s.date, newInflation);
        gameState.s.date.setFullYear(gameState.s.date.getFullYear() + 1);
    }

    const nextYear = () => {
        endYear();
        setPage(0);
    }

    const taxes = CalculateTaxes(Math.max(0, character.salary * (1 - character.pretirement / 100) - 15750));

    const monthlyLivingExpenses = character.monthlyLivingExpenses.map(e => e.amount)
        .reduce((sum, curr) => sum + curr, 0) * inflation;
    const livingExpenses = monthlyLivingExpenses * 12;
    const minLoanPayments = character.loans.reduce((sum, l) => sum + l.getPayment(), 0);

    const newSavings = character.salary * (100 - character.pinvestments - character.pretirement - character.pleisure) / 100 - taxes - livingExpenses - minLoanPayments;
    const ploans = character.loans.reduce((sum, l) => sum + l.getPayment(), 0) / character.salary * 100;


    const [lifeEventManager] = useState(new LifeEventManager(gameState.s.date, nextYear, render, [
        new LifeEvent("Education", gameState.s.date, <>
            <h2>Choose your education path</h2>
            <div className="flex justify-center gap-8 mt-6">
                <div className="eventButton panelButton"
                     onClick={() => {
                         const previousExpenses = character.monthlyLivingExpenses;
                         character.monthlyLivingExpenses = [];
                         character.savingsAccount.balance = 30000 * random.float(.7, 1.3);
                         endYear();
                         character.salary = 42000 * random.float(.95, 1.1);
                         character.monthlyLivingExpenses = previousExpenses;
                         endYear();
                         endYear();
                         endYear();
                         endYear();
                         character.salary = 48000 * random.float(.95, 1.1);
                         character.satisfaction = 40 * random.float(.9, 1.3);
                         character.pleisure = 10;
                         lifeEventManager.NextEvent();
                     }}>
                    <h3 className="text-gray-700 font-bold">High School</h3>
                    <p className="text-gray-700">Graduates that go straight into the workforce start building their
                        wealth earlier and don't have to spend money on education.</p>
                </div>
                <div className="eventButton panelButton"
                     onClick={() => {
                         const previousExpenses = character.monthlyLivingExpenses;
                         character.monthlyLivingExpenses = [];
                         character.savingsAccount.balance = 30000 * random.float(.7, 1.3);
                         endYear();
                         character.monthlyLivingExpenses = [
                             {name: "Rent", amount: 500},
                             {name: "Utilities", amount: 50},
                             {name: "Groceries", amount: 150},
                             {name: "Car Gas", amount: 20},
                             {name: "Car Maintenance", amount: 30},
                             {name: "Car Insurance", amount: 236},
                             {name: "Health Insurance", amount: 200},
                         ];

                         character.addLoan(new Loan("Trade School Debt", 10000 * random.float(.9, 1.1), character.savingsAccount, 1.067, true));
                         character.savingsAccount.balance += 10000;
                         character.loans[0].balance += 10000;
                         endYear();
                         character.loans[0].balance += 10000 * random.float(.9, 1.1);
                         endYear();
                         character.salary = 48000 * random.float(.95, 1.3);
                         character.monthlyLivingExpenses = previousExpenses;
                         endYear();
                         endYear();
                         character.salary = 53000 * random.float(.95, 1.3);
                         character.satisfaction = 42 * random.float(.9, 1.3);
                         character.pleisure = 10;
                         lifeEventManager.NextEvent();
                     }}>
                    <h3 className="text-gray-700 font-bold">Trade School</h3>
                    <p className="text-gray-700">Trade school is around a one year program that emphasizes going into
                        the workforce early. The practical experience from a trade school certificate allows entry
                        into more specialized work areas.</p>
                </div>
                <div className="eventButton panelButton"
                     onClick={() => {
                         lifeEventManager.ReplaceEvent(new LifeEvent("Choosing a College", gameState.s.date, <>
                             <div className="flex justify-center gap-8">
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          const previousExpenses = character.monthlyLivingExpenses;
                                          character.monthlyLivingExpenses = [];
                                          character.savingsAccount.balance = 30000 * random.float(.7, 1.3);
                                          endYear();
                                          character.monthlyLivingExpenses = [
                                              {name: "Rent", amount: 500},
                                              {name: "Utilities", amount: 50},
                                              {name: "Groceries", amount: 150},
                                              {name: "Car Gas", amount: 20},
                                              {name: "Car Maintenance", amount: 30},
                                              {name: "Car Insurance", amount: 236},
                                              {name: "Health Insurance", amount: 200},
                                          ];

                                          character.addLoan(new Loan("College Debt", 4000 * random.float(.9, 1.1), character.savingsAccount, 1.067, true));
                                          character.savingsAccount.balance += 10000;
                                          character.loans[0].balance += 10000;
                                          endYear();
                                          character.loans[0].balance += 4000 * random.float(.9, 1.1);
                                          endYear();
                                          character.monthlyLivingExpenses = previousExpenses;
                                          character.salary = 52000 * random.float(.90, 1.3);
                                          endYear();
                                          endYear();
                                          character.salary = 57000 * random.float(.9, 1.3);
                                          character.satisfaction = 44 * random.float(.9, 1.3);
                                          character.pleisure = 10;
                                          lifeEventManager.NextEvent();
                                      }}>
                                     <h3 className="text-gray-700 font-bold">Community College</h3>
                                     <p className="text-gray-700">An associates degree is a two year program that
                                         balances college education and going into the workforce early. It is less
                                         expensive than other colleges, but won't be as specialized.</p>
                                 </div>
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          character.savingsAccount.balance = 30000 * random.float(.7, 1.3);
                                          const previousExpenses = character.monthlyLivingExpenses;
                                          character.monthlyLivingExpenses = [];
                                          endYear();
                                          character.monthlyLivingExpenses = [
                                              {name: "Rent", amount: 500},
                                              {name: "Utilities", amount: 50},
                                              {name: "Groceries", amount: 150},
                                              {name: "Car Gas", amount: 20},
                                              {name: "Car Maintenance", amount: 30},
                                              {name: "Car Insurance", amount: 236},
                                              {name: "Health Insurance", amount: 200},
                                          ];

                                          character.addLoan(new Loan("College Debt", 20000 * random.float(.9, 1.1), character.savingsAccount, 1.067, true));
                                          character.savingsAccount.balance += 30000;
                                          character.loans[0].balance += 30000;
                                          endYear();
                                          character.loans[0].balance += 20000 * random.float(.9, 1.1);
                                          endYear();
                                          character.loans[0].balance += 20000 * random.float(.9, 1.1);
                                          character.savingsAccount.balance += 25000;
                                          character.loans[0].balance += 25000;
                                          endYear();
                                          character.loans[0].balance += 20000 * random.float(.9, 1.1);
                                          endYear();
                                          character.monthlyLivingExpenses = previousExpenses;
                                          character.salary = 80000 * random.float(.85, 1.3);
                                          character.satisfaction = 50 * random.float(.9, 1.3);
                                          character.pleisure = 10;
                                          lifeEventManager.NextEvent();
                                      }}>
                                     <h3 className="text-gray-700 font-bold">Public University</h3>
                                     <p className="text-gray-700">A bachelors degree is a four year program that focuses
                                         on a specific topic. Public universities provide more depth, but can be
                                         expensive.</p>
                                 </div>
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          character.savingsAccount.balance = 30000 * random.float(.7, 1.3);
                                          const previousExpenses = character.monthlyLivingExpenses;
                                          character.monthlyLivingExpenses = [];
                                          endYear();
                                          character.monthlyLivingExpenses = [
                                              {name: "Rent", amount: 500},
                                              {name: "Utilities", amount: 50},
                                              {name: "Groceries", amount: 150},
                                              {name: "Car Gas", amount: 20},
                                              {name: "Car Maintenance", amount: 30},
                                              {name: "Car Insurance", amount: 236},
                                              {name: "Health Insurance", amount: 200},
                                          ];

                                          character.addLoan(new Loan("College Debt", 50000 * random.float(.9, 1.1), character.savingsAccount, 1.067, true));
                                          character.savingsAccount.balance += 20000;
                                          character.loans[0].balance += 20000;
                                          endYear();
                                          character.loans[0].balance += 50000 * random.float(.9, 1.1);
                                          character.savingsAccount.balance += 20000;
                                          character.loans[0].balance += 20000;
                                          endYear();
                                          character.loans[0].balance += 50000 * random.float(.9, 1.1);
                                          character.savingsAccount.balance += 20000;
                                          character.loans[0].balance += 20000;
                                          endYear();
                                          character.loans[0].balance += 50000 * random.float(.9, 1.1);
                                          character.savingsAccount.balance += 20000;
                                          character.loans[0].balance += 20000;
                                          endYear();
                                          character.monthlyLivingExpenses = previousExpenses;
                                          character.salary = 83000 * random.float(.85, 1.3);
                                          character.satisfaction = 48 * random.float(.9, 1.3);
                                          character.pleisure = 10;
                                          lifeEventManager.NextEvent();
                                      }}>
                                     <h3 className="text-gray-700 font-bold">Private University</h3>
                                     <p className="text-gray-700">A bachelors degree is a four year program that focuses
                                         on a specific topic. While private universities are expensive they
                                         are often more prestigious.</p>
                                 </div>
                             </div>
                         </>, true));
                     }}>
                    <h3 className="text-gray-700 font-bold">College</h3>
                    <p className="text-gray-700">Obtaining an associates or bachelors degree allows entry into
                        specialized areas. College degrees can be expensive and may need to be paid through loans.</p>
                </div>
            </div>
        </>, true),
        new LifeEvent("Moving Out", gameState.s.date, <>
            <h2>Its time to start your journey!</h2>
        </>),
        new LifeEvent("Day Trading", gameState.s.date,
            <DayTrading gameState={gameState.s}/>, true),
        new LifeEvent("Event Tutorial", new Date(gameState.s.date.getFullYear() + 6, 1),
            (<div><p>During the year you will encounter events that may have a financial impact.</p></div>)),
    ]));
    const activeEvent = lifeEventManager.GetActiveEvent(gameState.s.date);

    const tutorialManager = useRef(new TutorialManager([
        new TutorialChain("Year In Review Tutorial", () => gameState.s.page == 0, [
            new TutorialEvent("Year in review page", null, (<p className="text-gray-700">
                On this page, you will be looking at your money's performance from last year and the years before
                inorder to determine how to allocate this year's income. Each account that you own will show up on this
                page.
            </p>), null, null, "Next"),
            new TutorialEvent("Savings history", null, (<p className="text-gray-700">
                Here is your savings account, currently you have a balance
                of {formatter.format(character.savingsAccount.balance)}. Below the account you can see a graph of the
                accounts
                previous balance.
            </p>), "YIRAccountSavings Account", null, "Next"),
            new TutorialEvent("Asset Positions", null, (<p className="text-gray-700">
                Here is a pie chart displaying your portfolio and what positions your money is in.
            </p>), "DonutChart", null, "Close"),
        ])
    ], render));

    useEffect(() => {
        character.accounts = [character.savingsAccount, character.investmentAccount, character.retirementAccount];
        document.addEventListener("keyup", (e) => {
            if (e.key == "Enter") {
                if (document.getElementById("transfer-modal")!.style.display == "block") {
                    document.getElementById("transfer-confirm")!.click();
                    e.stopImmediatePropagation();
                } else if (document.getElementById("debt-modal")!.style.display == "block") {
                    document.getElementById("debt-confirm")!.click();
                    e.stopImmediatePropagation();
                }
            } else if (e.key == "n") {
                if (document.getElementById("transfer-modal")!.style.display == "block") {
                    document.getElementById("transfer-confirm")!.click();
                    e.stopImmediatePropagation();
                } else if (document.getElementById("debt-modal")!.style.display == "block") {
                    document.getElementById("debt-confirm")!.click();
                    e.stopImmediatePropagation();
                } else if (tutorialManager.current.activeTutorial != null) {
                    tutorialManager.current.nextEvent();
                    e.stopImmediatePropagation();
                } else if (gameState.s.page < pages.length - 1) {
                    gameState.s.nextPage();
                    e.stopImmediatePropagation();
                } else if (lifeEventManager.GetActiveEvent(gameState.s.date) != null && !lifeEventManager.GetActiveEvent(gameState.s.date)!.customContinue) {
                    lifeEventManager.NextEvent();
                    e.stopImmediatePropagation();
                }
            } else if (e.key == "b") {
                if (document.getElementById("transfer-modal")!.style.display == "block") {
                    document.getElementById("transfer-cancel")!.click();
                    e.stopImmediatePropagation();
                    return;
                }
                if (document.getElementById("debt-modal")!.style.display == "block") {
                    document.getElementById("debt-cancel")!.click();
                    e.stopImmediatePropagation();
                    return;
                }
                if (gameState.s.page < pages.length - 1) {
                    gameState.s.previousPage();
                    e.stopImmediatePropagation();
                }
            }
        });
    }, [])

    gameState.s.page = page;
    gameState.s.nextPage = nextPage;
    gameState.s.previousPage = previousPage;
    gameState.s.lifeEventManager = lifeEventManager;

    const pages = [
        <div className="flex flex-col gap-2 items-center">
            <h1>Year in review {gameState.s.date.getFullYear() - 1}</h1>
            <div className="grid grid-cols-2">
                {character.accounts.map((account, i) => (
                    <div key={i} id={"YIRAccount" + account.name}
                         className="flex flex-col items-center bg-amber-100 rounded-xl p-4 m-4 gap-1">
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
                <div id="DonutChart" className="flex flex-col items-center bg-amber-100 rounded-xl p-4 m-4 gap-1">
                    <h3 className="text-gray-700 font-bold">Total Assets</h3>
                    <DonutChart className="h-full w-full m-auto"
                                data={[
                                    {
                                        name: "Cash",
                                        amount: character.accounts.reduce((sum, curr) => sum + curr.balance, 0)
                                    },
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
                                label={formatter.format(character.accounts.reduce((sum, curr) => sum + curr.getTotalValue(), 0) - character.totalLoans.balance)}
                                category="name" value="amount" showLabel={true}
                                valueFormatter={(number: number) => formatter.format(number)}/>
                </div>
            </div>
            <div className="flex gap-2 justify-center">
                <button className="w-60 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>Next: Paycheck</h3>
                </button>
            </div>
        </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Allocation</h1>
            <div className="flex flex-col gap-2 w-1/2 rounded-2xl bg-amber-100 items-center pt-2 pb-2">
                <div className="grid grid-cols-3 w-full">
                    <p className="text-green-700 font-bold">Paycheck</p>
                    <p></p>
                    <p className="text-green-700 font-bold">{formatter.format(character.salary)}</p>
                    <hr></hr>
                    <hr></hr>
                    <hr></hr>

                    <p className="text-gray-700">Retirement</p>
                    <p className="text-gray-700">
                        <input name="character.pretirement" className="w-12 text-end"
                               min="0"
                               max={Math.min(24500 * inflation / character.salary * 100, 100)}
                               defaultValue={character.pretirement}
                               onChange={e => {
                                   character.pretirement = Math.min(1000, Math.max(0, e.target.valueAsNumber));
                                   render();
                               }}
                               type="number">
                        </input>%</p>
                    <p className="text-gray-700">{formatter.format(character.salary * character.pretirement / 100)}</p>


                    <p className="text-red-800">Taxes</p>
                    <p className="text-red-800">{Math.round(taxes / character.salary * 100)}%</p>
                    <p className="text-red-800">{formatter.format(taxes)}</p>

                    {character.monthlyLivingExpenses.map(({name, amount}, i) => {
                        return ([
                            <p className="text-red-800" key={i + "1"}>{name}</p>,
                            <p className="text-red-800"
                               key={i + "2"}>{Math.round(amount * 12 * inflation / character.salary * 100)}%</p>,
                            <p className="text-red-800" key={i + "3"}>{formatter.format(amount * inflation * 12)}</p>
                        ]);
                    })}

                    {character.loans.length > 0 ? [
                        <p className="text-red-800" key="111">Loans</p>,
                        <p className="text-red-800" key="222">{Math.round(ploans)}%</p>,
                        <p className="text-red-800"
                           key="333">{formatter.format(minLoanPayments)}</p>
                    ] : []}

                    <p className="text-gray-700">Investments</p>
                    <p className="text-gray-700">
                        <input name="character.pinvestments" className="w-12 text-end"
                               min="0"
                               defaultValue={character.pinvestments}
                               onChange={e => {
                                   character.pinvestments = Math.min(1000, Math.max(0, e.target.valueAsNumber));
                                   render();
                               }}
                               type="number">
                        </input>%</p>
                    <p className="text-gray-700">{formatter.format(character.salary * character.pinvestments / 100)}</p>

                    <p className="text-gray-700">Leisure</p>
                    <p className="text-gray-700">
                        <input name="character.pleisure" className="w-12 text-end"
                               min="0"
                               defaultValue={character.pleisure}
                               onChange={e => {
                                   character.pleisure = Math.min(1000, Math.max(0, e.target.valueAsNumber));
                                   render()
                               }}
                               type="number">
                        </input>%</p>
                    <p className="text-gray-700">{formatter.format(character.salary * character.pleisure / 100)}</p>

                    <hr/>
                    <hr/>
                    <hr/>

                    <p className="text-yellow-600 font-bold">Savings</p>
                    <p className="text-yellow-600 font-bold">{Math.round(newSavings / character.salary * 100)}%</p>
                    <p className="text-yellow-600 font-bold">{formatter.format(newSavings)}</p>
                </div>

                <div className="flex gap-2">
                    <h3 className={newSavings > 0 ? "text-green-700" : "text-red-800"}>
                        Predicted Balance: {formatter.format(character.savingsAccount.balance + newSavings)}</h3>
                </div>
            </div>
            <div className="flex gap-2 justify-center">
                <button className="w-24 text-xl h-10 p-1 font-bold" onClick={() => previousPage()}><h3>Back</h3>
                </button>
                {character.loans.length > 0 ?
                    <button className="w-60 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>Next:
                        Loans</h3>
                    </button> :
                    <button className="w-60 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>Next:
                        Investments</h3>
                    </button>
                }
            </div>
        </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Loans</h1>
            {character.loans.length == 0 ?
                <h2 className="mt-2 text-green-700!">
                    Total Debt: {formatter.format(character.totalLoans.balance)}
                </h2> :
                <h2 className="mt-2 text-red-600!">
                    Total Debt: {formatter.format(character.totalLoans.balance)}
                </h2>
            }
            {character.loans.map((loan) =>
                <div key={loan.name} className="flex flex-col items-center w-124 bg-amber-100 rounded-xl p-4 m-4 gap-1">
                    <h3 className="text-gray-700 font-bold">{loan.name}</h3>
                    <p className="text-gray-700">Interest Rate: {Math.round(loan.interestRate * 100 - 100)}%
                        ({formatter.format(loan.balance * (loan.interestRate - 1))})</p>
                    <LineChart className="h-60 w-120" data={loan.history}
                               index="dateString"
                               showLegend={false}
                               minValue={0}
                               maxValue={Math.max(...loan.history.map(h => h.balance))}
                               aria-hidden="true"
                               categories={["balance"]}
                               valueFormatter={(number: number) => compactFormatter.format(number)}/>
                    <button className="w-60 text-xl h-10 font-bold" onClick={(e) => {
                        e.stopPropagation()
                        setFundsToTransfer(0);
                        setTransferFrom({selectedAccount: character.savingsAccount});
                        setTransferTo({selectedAccount: loan});
                        document.getElementById("debt-modal")!.style.display = "block";
                        document.getElementById("transfer-modal")!.style.display = "none";
                    }}><h3>Pay Immediately</h3></button>
                </div>
            )}
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
            <h2 className="mt-2 text-yellow-600! font-bold">
                Uninvested: {formatter.format(character.investmentAccount.balance)}
            </h2>
            <StockCard stock={indexFund.a} investmentAccount={character.investmentAccount} formatter={formatter}
                       compactFormatter={compactFormatter} render={render}/>
            <StockCard stock={bond.a} investmentAccount={character.investmentAccount} formatter={formatter}
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
            <h2 className="mt-2 text-yellow-600!">
                Uninvested: {formatter.format(character.retirementAccount.balance)}
            </h2>
            <StockCard stock={indexFund.a} investmentAccount={character.retirementAccount} formatter={formatter}
                       compactFormatter={compactFormatter} render={render}/>
            <StockCard stock={bond.a} investmentAccount={character.retirementAccount} formatter={formatter}
                       compactFormatter={compactFormatter} render={render}/>
            <div className="flex gap-2 justify-center">
                <button className="w-24 text-xl h-10 p-1 font-bold" onClick={() => previousPage()}><h3>Back</h3>
                </button>
                <button className="w-50 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}><h3>Next: Summary</h3>
                </button>
            </div>
        </div>,
        <div className="flex flex-col gap-2 items-center">
            <h1>Summary</h1>
            <div className="flex flex-col gap-2 w-1/2 rounded-2xl bg-amber-100 items-center pt-2 pb-2 mb-4">
                <div className="grid grid-cols-2 gap-2 w-full">
                    <p className="text-green-700">Take home income</p>
                    <p className="text-green-700">{formatter.format(character.salary - taxes)}</p>
                    <p className="text-red-800">Expenses</p>
                    <p className="text-red-800">{formatter.format(livingExpenses + minLoanPayments)}</p>
                    <p className="text-red-800">Loans</p>
                    <p className="text-red-800">{formatter.format(character.totalLoans.balance)}</p>
                    <p className="text-gray-700">Investments</p>
                    <p className="text-gray-700">{formatter.format(character.investmentAccount.balance)}</p>
                    <p className="text-gray-700">Retirement</p>
                    <p className="text-gray-700">{formatter.format(character.retirementAccount.balance)}</p>
                    <p className="text-green-700">Predicted Balance</p>
                    <p className="text-green-700">{formatter.format(character.savingsAccount.balance + newSavings)}</p>
                </div>
            </div>
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
                    <button className="w-50 text-xl h-10 p-1 font-bold" onClick={() => nextYear()}><h3>End of year</h3>
                    </button>
                </> : <>
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
            {page < pages.length ?
                <div className="fixed right-1 p-2 rounded-2xl justify-end bg-amber-100 mt-1">
                    <h2 className="text-gray-700! pt-1 pl-2 pr-2">Satisfaction: {Math.floor(character.satisfaction)}</h2>
                </div>
                : <></>}
            {pages[Math.min(page, pages.length - 1)]}
            <div id="debt-modal" className="flex hmodal justify-center"
                 onClick={() => document.getElementById("debt-modal")!.style.display = "none"}>
                <div
                    className="flex flex-col gap-2 ml-auto mr-auto mt-[15%] w-100 bg-amber-100 rounded-xl justify-center p-4"
                    onClick={e => e.stopPropagation()}>
                    <h3 className="text-gray-700">Pay Debt</h3>
                    <p className="text-gray-700 text-lg!">{transferFrom.selectedAccount?.name}</p>
                    <p className="text-gray-700 text-lg!">Balance: {formatter.format(transferFrom.selectedAccount?.balance ?? 0)}</p>
                    <p className="text-gray-700 text-lg!">{transferTo.selectedAccount?.name}</p>
                    <p className="text-red-800 text-lg!">Liabilities:
                        -{formatter.format(transferTo.selectedAccount?.balance ?? 0)}</p>

                    <div className="flex">
                        <p className="text-xl text-gray-700! p-2">$</p>
                        <input name="transfer-funds" className="w-80 bg-gray-200 rounded-xl p-1 text-gray-700"
                               autoFocus={true}
                               min=""
                               max={Math.min(transferFrom.selectedAccount?.balance ?? 0, transferTo.selectedAccount?.balance ?? 0)}
                               value={fundsToTransfer}
                               onChange={e =>
                                   setFundsToTransfer(Math.min(transferFrom.selectedAccount?.balance ?? 0, Math.min(transferTo.selectedAccount?.balance ?? 0,e.target.valueAsNumber)))}
                               type="number">
                        </input>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <button
                            id="debt-cancel"
                            onClick={() => document.getElementById("debt-modal")!.style.display = "none"}
                            className="p-2 w-25">Cancel
                        </button>
                        <button
                            id="debt-confirm"
                            disabled={isNaN(fundsToTransfer) || fundsToTransfer <= 0}
                            onClick={() => {
                                if (transferFrom.selectedAccount != null && transferTo.selectedAccount != null && transferFrom.selectedAccount != transferTo.selectedAccount) {
                                    const toTransfer = Math.min(Math.min(fundsToTransfer, transferFrom.selectedAccount.balance), transferTo.selectedAccount.balance);
                                    transferFrom.selectedAccount.balance -= toTransfer;
                                    transferTo.selectedAccount.balance -= toTransfer;
                                    character.refreshLoans();
                                    render();
                                }
                                document.getElementById("debt-modal")!.style.display = "none";
                            }}
                            className="p-2 w-25 enabled:bg-green-700! disabled:bg-gray-400!">Pay Debt
                        </button>
                    </div>
                </div>
            </div>
            <div id="transfer-modal" className="flex hmodal justify-center"
                 onClick={() => document.getElementById("transfer-modal")!.style.display = "none"}>
                <div
                    className="flex flex-col gap-2 ml-auto mr-auto mt-[15%] w-100 bg-amber-100 rounded-xl justify-center p-4"
                    onClick={e => e.stopPropagation()}>
                    <h3 className="text-gray-700">Transfer Funds</h3>
                    <Select
                        options={character.accounts.filter(a => a.isOwnedAccount)}
                        getOptionLabel={a => a.name}
                        value={transferFrom.selectedAccount}
                        isSearchable={false}
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles, backgroundColor: "#e5e7eb", borderRadius: 10,
                                border: state.isFocused ? "2px solid #fe9a00" : "2px solid #cccccc",
                                "&:hover": {
                                    border: "2px solid #fe9a00",
                                },
                                "&:focus": {
                                    border: "2px solid #fe9a00",
                                    boxShadow: "none"
                                },
                                boxShadow: "none"
                            }),
                            placeholder: (baseStyles) => ({
                                ...baseStyles, fontSize: 20
                            }),
                            singleValue: (baseStyles) => ({
                                ...baseStyles, fontSize: 20
                            }),
                            option: (baseStyles, state) => ({
                                ...baseStyles,
                                color: "#364153",
                                backgroundColor: state.isFocused ? "#e5e7eb" : undefined,
                                borderRadius: 10
                            })
                        }}
                        onChange={(a: Account | null) => {
                            let to = transferTo.selectedAccount;
                            if (a == to) to = transferFrom.selectedAccount;
                            setTransferFrom({selectedAccount: a});
                            setTransferTo({selectedAccount: to});
                        }}></Select>
                    {transferFrom.selectedAccount ?
                        <p className="text-gray-700 text-lg!">Balance: {formatter.format(transferFrom.selectedAccount!.balance)}
                        </p>
                        : <></>
                    }
                    <Select
                        options={character.accounts.filter(a => a != transferFrom.selectedAccount && a.isOwnedAccount)}
                        getOptionLabel={a => a.name}
                        value={transferTo.selectedAccount}
                        isSearchable={false}
                        styles={{
                            control: (baseStyles, state) => ({
                                ...baseStyles, backgroundColor: "#e5e7eb", borderRadius: 10,
                                border: state.isFocused ? "2px solid #fe9a00" : "2px solid #cccccc",
                                "&:hover": {
                                    border: "2px solid #fe9a00",
                                },
                                "&:focus": {
                                    border: "2px solid #fe9a00",
                                    boxShadow: "none"
                                },
                                boxShadow: "none"
                            }),
                            placeholder: (baseStyles) => ({
                                ...baseStyles, fontSize: 20
                            }),
                            singleValue: (baseStyles) => ({
                                ...baseStyles, fontSize: 20
                            }),
                            option: (baseStyles, state) => ({
                                ...baseStyles,
                                color: "#364153",
                                backgroundColor: state.isFocused ? "#e5e7eb" : undefined,
                                borderRadius: 10
                            })
                        }}
                        onChange={(a: Account | null) => setTransferTo({selectedAccount: a})}></Select>

                    <div className="flex">
                        <p className="text-xl text-gray-700! p-2">$</p>
                        <input name="transfer-funds" className="w-80 bg-gray-200 rounded-xl p-1 text-gray-700"
                               min=""
                               max={transferFrom.selectedAccount?.balance ?? 0}
                               disabled={transferFrom.selectedAccount == null}
                               value={fundsToTransfer}
                               onChange={e => setFundsToTransfer(Math.min(transferFrom.selectedAccount?.balance ?? 0, e.target.valueAsNumber))}
                               type="number">
                        </input>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <button
                            id="transfer-cancel"
                            onClick={() => document.getElementById("transfer-modal")!.style.display = "none"}
                            className="p-2 w-25">Cancel
                        </button>
                        <button
                            id="transfer-confirm"
                            disabled={transferFrom.selectedAccount == null || transferTo.selectedAccount == null || isNaN(fundsToTransfer) || fundsToTransfer <= 0}
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
            {/* eslint-disable-next-line react-hooks/refs */}
            {tutorialManager.current.getTutorialElement()}
            <div className="mb-20"></div>
            <div className="fixed bottom-1 left-1 z-9 h-16 right-1 justify-center p-2 rounded-2xl bg-amber-100">
                <div className="grid grid-cols-4 content-center align-items-middle mx-auto h-full ml-4 mr-4">
                    <h2 className="text-gray-700! align-self-middle text-start w-100">{fname} {lname} ({character.age})</h2>
                    {(page < pages.length ? [
                            <h2 className="text-gray-700! justify-self-end mt-2"
                                key="1">{formatter.format(character.savingsAccount.balance)}</h2>,
                            <button className="w-50 ml-4 text-xl font-bold h-10 justify-self-left" key="2"
                                    onClick={() => {
                                        setFundsToTransfer(NaN);
                                        setTransferFrom({selectedAccount: null});
                                        setTransferTo({selectedAccount: null});
                                        document.getElementById("transfer-modal")!.style.display = "block";
                                        document.getElementById("debt-modal")!.style.display = "none";
                                    }}>Transfer
                                Money
                            </button>]
                        : [<div key="1"></div>, <div key="2"></div>])}
                    <h2 className="justify-self-end text-gray-700!">{GetDateString(gameState.s.date)}</h2>
                </div>
            </div>
        </div>
    );
}

export default GamePage