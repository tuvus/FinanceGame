/* eslint-disable react-hooks/immutability */
import './App.css'
import random from "random";
import {useEffect, useRef, useState} from "react";
import {LineChart} from "./components/LineChart.tsx";
import Select from 'react-select';
import {Account, GameState, Loan, StockAccount, StockBond} from "./Data.tsx";
import StockCard from "./components/StockCard.tsx";
import {
    ButtonNext,
    CalculateTaxes,
    GetDateString,
    GetReactSelectStyle,
    InfoButton, InfoButtonTooltip,
    NumberInputAutoSelect
} from "./Utils.tsx";
import {DonutChart} from "./components/DonutChart.tsx";
import {LifeEvent, LifeEventManager, LifeEventSchedule, LifeEventScheduler} from "./EventManager.tsx";
import {TutorialChain, TutorialEvent, TutorialManager} from "./TutorialManager.tsx";
import DayTrading from "./events/DayTrading.tsx";
import PromotionEvent from "./events/Promotion.tsx";
import BrokenLaptopEvent from "./events/BrokenLaptop.tsx";
import {BalanceNumber, SatisfactionNumber, SavingsAccountTutorial} from "./UI.tsx";
import {BigTicketItemsPage} from "./components/BigTicketItems.tsx";
import {Outline} from "./components/Outline.tsx";
import {Car, Character, Goal} from "./Character.tsx";
import {CarShop} from "./events/CarShop.tsx";
import {marriedTaxBrackets, singleTaxBrackets} from "./Constants.tsx";
import PartnerMatch from "./events/PartnerMatch.tsx";

type GameProps = {
    fname: string; lname: string; tutorial: boolean;
}

interface TransferFundsSelectState {
    selectedAccount: Account | null;
}

function GamePage({fname, lname, tutorial}: GameProps) {
    const formatter = new Intl.NumberFormat("en", {style: "currency", currency: "USD", maximumFractionDigits: 2});
    const compactFormatter = new Intl.NumberFormat("en", {
        style: "currency",
        currency: "USD",
        notation: "compact",
        compactDisplay: "short"
    });
    const [page, setPage] = useState(999);
    const [character] = useState(new Character(fname, lname, [
        {name: "Rent", amount: 1400},
        {name: "Utilities", amount: 410},
        {name: "Internet", amount: 40},
        {name: "Phone Data", amount: 60},
        {name: "Groceries", amount: 150},
        {name: "Health Insurance", amount: 400},
    ], 17));
    const [gameState] = useState({s: new GameState(new Date(2026, 0), character, formatter, compactFormatter, tutorial)});
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
    const [selectedGoal, setSelectedGoal] = useState("");

    const startYear = () => {
        setPage(pages.length - 1);
        character.bigTicketItems.scheduleBigTicketItems(gameState.s.lifeEventManager!, gameState.s, gameState.s.date);
        character.scheduleTrips(gameState.s);
        character.checkGoals(gameState.s);
        gameState.s.lifeEventScheduler!.generateEvents();
        if (!lifeEventManager.getActiveEvent(gameState.s.date)) {
            lifeEventManager.addEvent(
                new LifeEvent("Another year passes", gameState.s.date,
                    (<div><h3 className="m-4">There were no special events this year.</h3></div>))
            );
        } else {
            lifeEventManager.addEvent(new LifeEvent("New Year", new Date(gameState.s.date.getFullYear(), 11, 31),
                <h3>The year of {gameState.s.date.getFullYear()} flew by quickly, now its time to plan for the next
                    year.</h3>));
        }
    }

    const endYear = () => {
        gameState.s.date.setMonth(11);
        gameState.s.date.setDate(31);
        gameState.s.date.setHours(18);
        const combinedSalary = character.salary + character.partnerSalary;
        const livingExpenses = (Array.from(character.monthlyLivingExpenses.values()).reduce((sum, curr) => sum + curr, 0)
            + character.getMonthlyCarCosts()) * gameState.s.inflation * 12;
        const taxableIncome = Math.max(0, combinedSalary * (1 - character.pretirement / 100) - (character.isMarried() ? 29200 : 15750) * gameState.s.inflation);
        character.taxableIncome = taxableIncome;
        const taxes = CalculateTaxes(taxableIncome, character.isMarried());
        const newSavings = combinedSalary * (100 - character.pinvestments - character.pretirement - character.pdiscretionary - character.ptrips) / 100 - taxes - livingExpenses;

        // Pay for wants
        const discretionarySpending = combinedSalary * character.pdiscretionary / 100 / gameState.s.inflation / (character.isMarried() ? 2 : 1);
        character.satisfaction += ((1.2 * discretionarySpending - 3500) / (Math.abs(discretionarySpending / 20) + 210)) * (character.loans.length > 0 ? .8 : 1);

        // Allocate money for trips
        character.tripBalance += combinedSalary * character.ptrips / 100;

        // Income and interest
        character.addMoney(newSavings);
        character.investmentAccount.balance += combinedSalary * character.pinvestments / 100;
        character.retirementAccount.balance += combinedSalary * character.pretirement / 100;

        // Big ticket items
        character.payMoney(character.bigTicketItems.getYearlyAllocation(gameState.s.date));
        character.bigTicketItems.doYearlyAllocations(gameState.s.date);

        //Stocks and bonds
        indexFund.a.balance *= random.float(.85, 1.2);
        bond.a.balance *= 1.052;

        // Inflation
        const newInflation = random.float(1.01, 1.04);
        gameState.s.inflation *= newInflation;
        indexFund.a.balance *= newInflation;

        // History log
        indexFund.a.endYear(gameState.s.date);
        bond.a.endYear(gameState.s.date);
        character.endYear(gameState.s, newInflation);
        gameState.s.date.setFullYear(gameState.s.date.getFullYear() + 1);
        gameState.s.date.setMonth(0);
        gameState.s.date.setDate(1);
        gameState.s.date.setHours(9);
        character.checkGoals(gameState.s);
    }

    const nextYear = () => {
        // Start accounts one year early to have a point on the graph
        if (gameState.s.gameYear == 1) {
            gameState.s.bigTicketItemsUnlocked = true;
        } else if (gameState.s.gameYear == 2) {
            gameState.s.investmentsUnlocked = true;
            gameState.s.character.accounts = [...gameState.s.character.accounts, gameState.s.character.investmentAccount];
        } else if (gameState.s.gameYear == 7) {
            gameState.s.retirementUnlocked = true;
            gameState.s.character.accounts = [...gameState.s.character.accounts, gameState.s.character.retirementAccount];
        }
        endYear();
        setPage(0);
        gameState.s.gameYear++;
    }

    const combinedSalary = character.salary + character.partnerSalary;
    const taxableIncome = Math.max(0, combinedSalary * (1 - character.pretirement / 100) - (character.isMarried() ? 29200 : 15750) * gameState.s.inflation);
    const taxes = CalculateTaxes(taxableIncome, character.isMarried());

    const monthlyLivingExpenses = (Array.from(character.monthlyLivingExpenses.values())
        .reduce((sum, curr) => sum + curr, 0) + character.getMonthlyCarCosts()) * gameState.s.inflation;
    const livingExpenses = monthlyLivingExpenses * 12;
    const minLoanPayments = character.loans.reduce((sum, l) => sum + l.getPayment(gameState.s.inflation), 0);

    const newSavings = combinedSalary * (100 - character.pinvestments - character.pretirement - character.pdiscretionary - character.ptrips) / 100 - taxes - livingExpenses - minLoanPayments - character.bigTicketItems.getYearlyAllocation(gameState.s.date);
    character.previousYearlyBalance = newSavings;
    const ploans = minLoanPayments / combinedSalary * 100;


    const [lifeEventManager] = useState(new LifeEventManager(gameState.s, nextYear, render, [
        new LifeEvent("Education", gameState.s.date, <>
            <h2>Choose your education path</h2>
            <div className="flex justify-center gap-8 mt-6">
                <div className="eventButton panelButton"
                     onClick={() => {
                         const previousExpenses = character.monthlyLivingExpenses;
                         character.savingsAccount.balance = 30000 * random.float(.9, 1.1);
                         endYear();
                         character.salary = 42000 * random.float(.95, 1.1);
                         character.monthlyLivingExpenses = previousExpenses;
                         endYear();
                         endYear();
                         endYear();
                         endYear();
                         character.salary = 48000 * random.float(1, 1.1);
                         character.satisfaction = 35 * random.float(.9, 1.3);
                         character.pdiscretionary = 10;
                         character.ptrips = 2;
                         lifeEventManager.nextEvent();
                     }}>
                    <h3 className="text-gray-700 font-bold">High School</h3>
                    <p className="text-gray-700">Graduates that go straight into the workforce start building their
                        wealth earlier and don't have to spend money on education.</p>
                </div>
                <div className="eventButton panelButton"
                     onClick={() => {
                         const previousExpenses = character.monthlyLivingExpenses;
                         character.monthlyLivingExpenses = new Map();
                         character.savingsAccount.balance = 30000 * random.float(.9, 1.1);
                         endYear();
                         [
                             {name: "Rent", amount: 500},
                             {name: "Utilities", amount: 50},
                             {name: "Groceries", amount: 150},
                             {name: "Health Insurance", amount: 200},
                         ].forEach(m => character.monthlyLivingExpenses.set(m.name, m.amount))

                         character.addLoan(new Loan("Trade School Debt", 10000 * random.float(.9, 1.1), character.savingsAccount, 1.067, true));
                         character.savingsAccount.balance += 10000;
                         character.loans[0].balance += 10000;
                         endYear();
                         character.loans[0].balance += 10000 * random.float(.9, 1.1);
                         endYear();
                         character.salary = 48000 * random.float(.9, 1.1);
                         character.monthlyLivingExpenses = previousExpenses;
                         endYear();
                         endYear();
                         character.salary = 53000 * random.float(1, 1.1);
                         character.satisfaction = 37 * random.float(.9, 1.3);
                         character.pdiscretionary = 10;
                         character.ptrips = 2;
                         character.education = "Trade School";
                         lifeEventManager.nextEvent();
                     }}>
                    <h3 className="text-gray-700 font-bold">Trade School</h3>
                    <p className="text-gray-700">Trade school is around a one year program that emphasizes going into
                        the workforce early. The practical experience from a trade school certificate allows entry
                        into more specialized work areas.</p>
                </div>
                <div className="eventButton panelButton"
                     onClick={() => {
                         lifeEventManager.replaceEvent(new LifeEvent("Choosing a College", gameState.s.date, <>
                             <div className="flex justify-center gap-8">
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          const previousExpenses = character.monthlyLivingExpenses;
                                          character.monthlyLivingExpenses = new Map();
                                          character.savingsAccount.balance = 30000 * random.float(.9, 1.1);
                                          endYear();
                                          [
                                              {name: "Rent", amount: 500},
                                              {name: "Utilities", amount: 50},
                                              {name: "Groceries", amount: 150},
                                              {name: "Health Insurance", amount: 200},
                                          ].forEach(m => character.monthlyLivingExpenses.set(m.name, m.amount))

                                          character.addLoan(new Loan("College Debt", 4000 * random.float(.9, 1.1), character.savingsAccount, 1.067, true));
                                          character.savingsAccount.balance += 10000;
                                          character.loans[0].balance += 10000;
                                          endYear();
                                          character.loans[0].balance += 4000 * random.float(.9, 1.1);
                                          endYear();
                                          character.monthlyLivingExpenses = previousExpenses;
                                          character.salary = 52000 * random.float(.90, 1.1);
                                          endYear();
                                          endYear();
                                          character.salary = 57000 * random.float(1, 1.1);
                                          character.satisfaction = 38 * random.float(.9, 1.3);
                                          character.pdiscretionary = 10;
                                          character.ptrips = 2;
                                          character.education = "Associates";
                                          lifeEventManager.nextEvent();
                                      }}>
                                     <h3 className="text-gray-700 font-bold">Community College</h3>
                                     <p className="text-gray-700">An associates degree is a two year program that
                                         balances college education and going into the workforce early. It is less
                                         expensive than other colleges, but won't be as specialized.</p>
                                 </div>
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          const previousExpenses = character.monthlyLivingExpenses;
                                          character.monthlyLivingExpenses = new Map();
                                          character.savingsAccount.balance = 30000 * random.float(.9, 1.1);
                                          endYear();
                                          [
                                              {name: "Rent", amount: 500},
                                              {name: "Utilities", amount: 50},
                                              {name: "Groceries", amount: 150},
                                              {name: "Health Insurance", amount: 200},
                                          ].forEach(m => character.monthlyLivingExpenses.set(m.name, m.amount))

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
                                          character.savingsAccount.balance += 20000;
                                          character.loans[0].balance += 20000;
                                          endYear();
                                          character.monthlyLivingExpenses = previousExpenses;
                                          character.salary = 80000 * random.float(1, 1.3);
                                          character.satisfaction = 42 * random.float(.9, 1.3);
                                          character.pdiscretionary = 10;
                                          character.ptrips = 2;
                                          character.education = "Bachelors";
                                          lifeEventManager.nextEvent();
                                      }}>
                                     <h3 className="text-gray-700 font-bold">Public University</h3>
                                     <p className="text-gray-700">A bachelors degree is a four year program that focuses
                                         on a specific topic. Public universities provide more depth, but can be
                                         expensive.</p>
                                 </div>
                                 <div className="eventButton panelButton"
                                      onClick={() => {
                                          const previousExpenses = character.monthlyLivingExpenses;
                                          character.monthlyLivingExpenses = new Map();
                                          character.savingsAccount.balance = 30000 * random.float(.9, 1.1);
                                          endYear();
                                          [
                                              {name: "Rent", amount: 500},
                                              {name: "Utilities", amount: 50},
                                              {name: "Groceries", amount: 150},
                                              {name: "Health Insurance", amount: 200},
                                          ].forEach(m => character.monthlyLivingExpenses.set(m.name, m.amount))

                                          character.addLoan(new Loan("College Debt", 50000 * random.float(.9, 1.1), character.savingsAccount, 1.067, true));
                                          character.savingsAccount.balance += 20000;
                                          character.loans[0].balance += 20000;
                                          endYear();
                                          character.loans[0].balance += 50000 * random.float(.9, 1.1);
                                          character.savingsAccount.balance += 20000;
                                          character.loans[0].balance += 20000;
                                          endYear();
                                          character.loans[0].balance += 50000 * random.float(.9, 1.1);
                                          character.savingsAccount.balance += 30000;
                                          character.loans[0].balance += 30000;
                                          endYear();
                                          character.loans[0].balance += 50000 * random.float(.9, 1.1);
                                          character.savingsAccount.balance += 30000;
                                          character.loans[0].balance += 30000;
                                          endYear();
                                          character.monthlyLivingExpenses = previousExpenses;
                                          character.salary = 83000 * random.float(1, 1.3);
                                          character.satisfaction = 44 * random.float(.9, 1.3);
                                          character.pdiscretionary = 10;
                                          character.ptrips = 2;
                                          character.education = "Bachelors";
                                          lifeEventManager.nextEvent();
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
        new LifeEvent("Financial Planning", gameState.s.date, <div className="flex flex-col w-full items-center">
            <div className="flex flex-col items-center gap-2 w-3/4">
                <h2>As an adult you need to plan your finances and how you handle your money.</h2>
                <p>Now that you are on your own there are many things you would like to do: Buy a car, buy a house, go
                    on vacations, and maybe even start a family. None of these come for free, you will need to
                    efficiently allocate the money you make from your new job in order to achieve these goals. In
                    January of each year you will sit down and plan your finances for the upcoming year. It's time to
                    take what you have learned about money and plan your adventure! But be careful and keep some money
                    in savings, life has it's twists and turns!</p>
                <ButtonNext
                    style="w-50 text-xl h-10 p-1 font-bold mt-2"
                    text="Ready to start!" action={
                    () => {
                        character.addGoal(new Goal("Plan Finances", "Plan your finances for the year such that you will end with a positive yearly balance.", new Date(gameState.s.date.getFullYear() + 1, 0),
                            (gameState, goal) => character.previousYearlyBalance > 0
                                && gameState.date.getFullYear() >= goal.targetDate.getFullYear(),
                            (gameState) => {
                                gameState.character.satisfaction += 1;
                                gameState.character.milesDriven = 1000;
                                gameState.lifeEventManager!.addEvent(
                                    new LifeEvent("First plan!", new Date(gameState.date.getFullYear(), 0, 21),
                                        <div className="flex flex-col w-full items-center">
                                            <p className="w-3/4">Congratulations on finishing your first year plan, it
                                                wasn't so hard after all! With your plan you can now enjoy your year
                                                without
                                                having to worry about your financing. Now its time to stick to your
                                                plan!</p>
                                        </div>
                                    ));
                            }));
                        gameState.s.lifeEventManager!.nextEvent();
                    }}/>
            </div>
        </div>, true),
        new LifeEvent("Buying a Car", gameState.s.getRandomDateFromGameYear(1),
            (<div className="flex flex-col items-center gap-4">
                <p className="w-200">Your car is nearing the end of it's lifespan, and it is about time to buy a new
                    one. Luckily, your parents have offered to subsidise your purchase in celebration of your new job.
                    It is time to decide to get a new or used car, and how decked-out it is.</p>
                <ButtonNext style="w-60 text-xl h-10 font-bold" text="Choose a car" action={() => {
                    lifeEventManager.replaceEvent(new LifeEvent("Choosing a car", gameState.s.date,
                        <div className="flex flex-col items-center w-full">
                            <div className="flex flex-col items-center gap-4 w-3/4">
                                <p>Your parents gave you {formatter.format(30000 * gameState.s.inflation)} to
                                    buy a car. Choose the type of car you want to buy, you may also buy a more
                                    expensive car by using cash from your savings. You are allowed to keep the
                                    money that you don't
                                    spend on the car.</p>
                                <CarShop gameState={gameState.s}
                                         action={(gameState: GameState) => gameState.lifeEventManager!.nextEvent()}
                                         allocatedMoney={30000 * gameState.s.inflation}
                                />
                            </div>
                        </div>, true
                    ));
                }}/>
            </div>), true),
        new LifeEvent("Finding a partner", gameState.s.getRandomDateFromGameYear(1),
            <div className="flex flex-col w-full items-center">
                <div className="flex flex-col justify-center gap-2 w-3/4">
                    <p>Now that you have settled in its time to focus on your life goals: finding a partner. You've had
                        some experience search in the past but now that you are settled, its time to get real. Who are
                        you searching for?</p>
                    <div className="flex justify-center gap-8 mt-6">
                        <div
                            className="eventButton panelButton"
                            onClick={() => {
                                gameState.s.character.partnerAspiration = "Boyfriend";
                                gameState.s.character.satisfaction += 1;
                                gameState.s.character.partnerPronoun = "he";
                                gameState.s.character.partnerPronoun2 = "him";
                                lifeEventManager.replaceEvent(new LifeEvent("Searching for a boyfriend", gameState.s.date,
                                    <div className="flex flex-col w-full items-center">
                                        <div className="flex flex-col items-center gap-2 w-3/4">
                                            <p>You double your efforts searching for the right match, partaking in more
                                                social gatherings and go to local events. You might not have found him
                                                yet, but at least you can enjoying your time searching.</p>
                                        </div>
                                    </div>, false))
                                lifeEventManager.addEvent(new LifeEvent("Its a match!", gameState.s.getRandomDateFromGameYear(2),
                                    <PartnerMatch gameState={gameState.s}/>, true));
                            }}>
                            <p className="text-gray-700">Boyfriend</p>
                        </div>
                        <div
                            className="eventButton panelButton"
                            onClick={() => {
                                gameState.s.character.partnerAspiration = "Girlfriend";
                                gameState.s.character.satisfaction += 1;
                                gameState.s.character.partnerPronoun = "she";
                                gameState.s.character.partnerPronoun2 = "her";
                                lifeEventManager.replaceEvent(new LifeEvent("Searching for a girlfriend", gameState.s.date,
                                    <div className="flex flex-col w-full items-center">
                                        <div className="flex flex-col items-center gap-2 w-3/4">
                                            <p>You double your efforts searching for the right match, partaking in more
                                                social gatherings and go to local events. You might not have found her
                                                yet, but at least you can enjoying your time searching.</p>
                                        </div>
                                    </div>, false))
                                lifeEventManager.addEvent(new LifeEvent("Its a match!", gameState.s.getRandomDateFromGameYear(2),
                                    <PartnerMatch gameState={gameState.s}/>, true));
                            }}>
                            <p className="text-gray-700">Girlfriend</p>
                        </div>
                        <div
                            className="eventButton panelButton"
                            onClick={() => {
                                gameState.s.character.partnerAspiration = "Diverse";
                                gameState.s.character.satisfaction += 1;
                                gameState.s.character.partnerPronoun = "they";
                                gameState.s.character.partnerPronoun2 = "them";
                                lifeEventManager.replaceEvent(new LifeEvent("Searching for a partner", gameState.s.date,
                                    <div className="flex flex-col w-full items-center">
                                        <div className="flex flex-col items-center gap-2 w-3/4">
                                            <p>You double your efforts searching for the right match, partaking in more
                                                social gatherings and go to local events. You might not have found them
                                                yet, but at least you can enjoying your time searching.</p>
                                        </div>
                                    </div>, false))
                                lifeEventManager.addEvent(new LifeEvent("Its a match!", gameState.s.getRandomDateFromGameYear(2),
                                    <PartnerMatch gameState={gameState.s}/>, true));
                            }}>
                            <p className="text-gray-700">Diverse</p>
                        </div>
                        <div
                            className="eventButton panelButton"
                            onClick={() => {
                                gameState.s.character.partnerAspiration = "Pet";
                                gameState.s.character.satisfaction += 3;
                            }}>
                            <p className="text-gray-700">Pet</p>
                        </div>
                    </div>
                </div>

            </div>, true),
    ]));
    const activeEvent = lifeEventManager.getActiveEvent(gameState.s.date);

    const tutorialManager = useRef(new TutorialManager(gameState.s, [
        new TutorialChain("Year In Review Tutorial", () => gameState.s.getCurrentPage().name == "Year in review", [
            new TutorialEvent("Year in review page", null, (<p className="text-gray-700">
                On this page, you will be looking at your money's performance from last year and the years before
                inorder to determine how to allocate this year's income. Each account that you own will show up on this
                page.
            </p>), null, null, "Next"),
            new TutorialEvent("Savings history", null,
                <SavingsAccountTutorial gameState={gameState.s}/>, "YIRAccountSavings Account", null, "Next"),
            new TutorialEvent("Asset Positions", null, (<p className="text-gray-700">
                Here is a pie chart displaying your <a href="https://www.investopedia.com/terms/p/portfolio.asp"
                                                       target="_blank">portfolio</a>, or where your money is.
            </p>), "DonutChart", null, "Close"),
        ]),
        new TutorialChain("Budget Tutorial", () => gameState.s.getCurrentPage().name == "Budget", [
            new TutorialEvent("Budget Page", null, (<p className="text-gray-700">
                Congratulations on getting your first job! This page shows your paycheck fro the year,
                and gives you the ability to <a
                href="https://www.investopedia.com/terms/a/assetallocation.asp" target="_blank">allocate</a> the money.
            </p>), null, null, "Next"),
            new TutorialEvent("Paycheck", null, (<p className="text-gray-700">
                This your salary at your current job. This is your <a
                href="https://www.investopedia.com/terms/g/grossincome.asp#toc-what-is-gross-income" target="_blank">gross
                income</a>, which does not include taxes or any other expenses. Sadly, this isn't the amount of money
                you get to take home.
            </p>), "Paycheck", null, "Next"),
            new TutorialEvent("Income Tax", null, (<p className="text-gray-700">
                This is how much you owe in <a href="https://www.investopedia.com/terms/i/incometax.asp"
                                               target="_blank">income taxes</a>.
            </p>), "IncomeTaxes", null, "Next"),
            new TutorialEvent("Living Expenses", null, (<p className="text-gray-700">
                Next, you will find a list of <a href="https://www.investopedia.com/terms/c/cost-of-living.asp"
                                                 target="_blank">living expenses</a> based on your lifestyle. Your
                habits and way of living determine these costs. Some people are more frugal, and some people live more
                lavish, but as long as you are living within your means you shouldn't sacrifice your lifestyle to save
                more money.
            </p>), "ItemizedLivingExpenses", null, "Next"),
            new TutorialEvent("Loans", () => character.loans.length > 0, (<p className="text-gray-700">
                You have acquired debt in the form of <a
                href="https://www.investopedia.com/terms/l/loan.asp#toc-what-is-a-loan" target="_blank">loans</a> to pay
                for schooling. Loans have a minimum payment, which you have to pay monthly. For simplicity, these
                payments are aggregated into yearly installments.
            </p>), "Loans", null, "Next"),
            new TutorialEvent("Discretionary Spending", null, (<p className="text-gray-700">
                Discretionary spending is money that you have allocated towards your wants. This includes things like
                shopping, subscriptions, etc. You can press the up and down arrows to change the percentage of your
                paycheck that is allocated towards this category.
            </p>), "Discretionary", null, "Next"),
            new TutorialEvent("Vacation", null, (<p className="text-gray-700">
                Vacations are a great way to see the world, money budgeted for vacations will be pooled together to go
                on trips the following year. The type and amount of trips that you can go on depend on how much money is
                budgeted.
            </p>), "Vacation", null, "Next"),
            new TutorialEvent("Savings", null, (<p className="text-gray-700">
                This is the leftover money from your salary, which will go into your <a
                href="https://www.investopedia.com/terms/s/savings.asp" target="_blank">savings account</a>. You may
                also withdraw money from your savings account towards your other accounts.
            </p>), "Savings", null, "Next"),
            new TutorialEvent("Predicted Balance", null, (<p className="text-gray-700">
                This is the predicted balance that you will have at the start of next year. It is calculated from your
                current balance plus your savings from your paycheck.
            </p>), "PredictedBalance", null, "Close"),
        ]),
        new TutorialChain("College Debt Tutorial", () => gameState.s.getCurrentPage().name == "Loans" && character.loans.some(l => l.name == "College Debt"), [
            new TutorialEvent("College Debt", null, (<p className="text-gray-700">
                You have <a href="https://www.investopedia.com/terms/d/debt.asp" target="_blank">debt</a> from going on
                to college. This is the page where you will be able to manage it.
            </p>), null, null, "Next"),
            new TutorialEvent("College Debt", null, (<p className="text-gray-700">
                Something about college debt
                College debt can be a lot of money. Taking on grants and scholarships is ideal, as they help pay for
                college without needing to pay the money back later. If those don't fully cover your school, subsidized
                loans are the next best resource, as they don't acquire interest during your schooling. Federal loans
                are more flexible than private loans, and tend to have lower interest rates.
            </p>), "LoanCollege Debt", null, "Next"),
        ]),
        new TutorialChain("Trade School Debt Tutorial", () => gameState.s.getCurrentPage().name == "Loans" && character.loans.some(l => l.name == "Trade School Debt"), [
            new TutorialEvent("Trade School Debt", null, (<p className="text-gray-700">
                You have <a href="https://www.investopedia.com/terms/d/debt.asp" target="_blank">debt</a> from going to
                trade school.
                On this page you will be able to see and manage your debt.
            </p>), null, null, "Next"),
            new TutorialEvent("Trade School Debt", null, (<p className="text-gray-700">
                It is possible for financial aid that people get for going to college to also be available for those
                going into trade schools.
                Taking on grants and scholarships is ideal, as they help pay for schooling
                without needing to pay the money back later. If those don't fully cover your school, subsidized loans
                are the next best resource, as they don't acquire interest during your schooling. Federal loans are more
                flexible than private loans, and tend to have lower interest rates.
            </p>), "LoanTrade School Debt", null, "Next"),
        ]),
        new TutorialChain("Credit Card Debt Tutorial", () => gameState.s.getCurrentPage().name == "Loans" && character.loans.some(l => l.name == "Credit Card Debt"), [
            new TutorialEvent("Credit Card Debt", null, (<p className="text-gray-700">
                You have credit card <a href="https://www.investopedia.com/terms/d/debt.asp" target="_blank">debt</a>.
                On this page you will be able to see and manage your debt.
            </p>), null, null, "Next"),
            new TutorialEvent("Credit Card Debt", null, (<p className="text-gray-700">
                Credit card loans have very high interest rates. This can make them hard to pay off when they start
                gaining interest.
            </p>), "LoanCredit Card Debt", null, "Close"),
        ]),
        new TutorialChain("Loan Page Tutorial", () => gameState.s.page == 2, [
            new TutorialEvent("Loans", null, (<p className="text-gray-700">
                Each loan consists of liabilities, this is the amount of money that you need to pay back to the lender.
                Each year the liability increases by the interest rate, meaning, the longer you take to pay off the
                debt, the more money you have to pay. Each loan has a minimum payment that must be paid periodically
                which will show on the budget table.
            </p>), null, null, "close"),
        ]),
        new TutorialChain("Summary Tutorial", () => gameState.s.getCurrentPage().name == "Summary", [
            new TutorialEvent("Summary Page", null, (<p className="text-gray-700">
                Here you can see your financial status at a glance. Take time to review and finalize your plans for the
                year.
            </p>), null, null, "Next"),
            new TutorialEvent("Take Home Income", null, (<p className="text-gray-700">
                Here is your take home income, which is your salary minus the income taxes you will pay.
            </p>), "takeHomeIncomeText", null, "Next"),
            new TutorialEvent("Expenses", null, (<p className="text-gray-700">
                This is the sum of your living expenses and your yearly loan payments.
            </p>), "expensesText", null, "Next"),
            new TutorialEvent("Summary", null, (<p className="text-gray-700">
                The pie chart shows the current positions of your money. Your net worth shows your total assets minus
                your total liabilities.
            </p>), "summary", null, "Close"),
        ]),
        new TutorialChain("Investment Tutorial Year In Review", () => gameState.s.getCurrentPage().name == "Year in review" && gameState.s.gameYear >= 3, [
            new TutorialEvent("Investment Accounts", null, (<p className="text-gray-700">
                It is time to learn about investing.
            </p>), null, null, "Next"),
            new TutorialEvent("Investment Accounts", null, (<p className="text-gray-700">
                You now have a new investment account where you will be able to
                invest your money!
            </p>), "YIRAccountInvestment Account", null, "Close"),
        ]),
        new TutorialChain("Investment Tutorial Budget", () => gameState.s.getCurrentPage().name == "Budget" && gameState.s.gameYear >= 3, [
            new TutorialEvent("Budgeting for Investments", null, (<p className="text-gray-700">
                The investment account now shows up in the budget page. You can change the amount to be allocated
                towards the investment account by using the arrows.
            </p>), null, null, "Next"),
            new TutorialEvent("Transferring Money", null, (<p className="text-gray-700">
                Although budgeting for investments is the main way you can send money to the investment account, you can
                click on the
                transfer money button to transfer money between different accounts at anytime in the year.
            </p>), "BottomBar", null, "Close"),
        ]),
        new TutorialChain("Investment Tutorial Portfolio", () => gameState.s.getCurrentPage().name == "Investments" && gameState.s.gameYear >= 3, [
            new TutorialEvent("Investing", null, (<p className="text-gray-700">
                Here is the page where you will be able to invest your money into stocks and bonds. You can click on the
                different types of investments to expand them. This will display a graph of the investment's performance
                history and a buy button.
            </p>), null, null, "Next"),
            new TutorialEvent("Investing", null, (<p className="text-gray-700">
                This is the amount of money you have allocated towards investing, but have not yet invested. You will
                most likely want to invest all of it before ending the year, but you don't have to.
            </p>), "Uninvested", null, "Next"),
            new TutorialEvent("Index Fund", null, (<p className="text-gray-700">
                The <a href="https://www.investopedia.com/terms/i/indexfund.asp#toc-what-are-index-funds"
                       target="_blank">index fund</a> is a type of stock that invests in multiple stocks to mirror the
                stock market index. Due to including lots of stocks or bonds they are more diverse and don't rely as
                much on one stock doing well, reducing risk. The current share price and the percentage change from last
                year are displayed at the top.
            </p>), "IndexFund", null, "Next"),
            new TutorialEvent("Bond", null, (<p className="text-gray-700">
                <a href="https://www.investopedia.com/terms/b/bond.asp" target="_blank">Bonds</a> are a form of
                investment that is considered safer than stocks, but generally won't give as much return as stocks
                would. They have fixed income and have a set end date. The current yearly interest rate is displayed at
                the top.
            </p>), "Bond", null, "Close"),
        ]),
        new TutorialChain("Retirement Tutorial Portfolio", () => gameState.s.getCurrentPage().name == "Retirement" && gameState.s.gameYear >= 8, [
            new TutorialEvent("Saving for Retirement", null,
                (<p className="text-gray-700">Now that you are getting to the middle of your life its time to start
                    saving for retirement. You now have access to your retirement account. This account works similar to
                    your investment account but for retirement.</p>),
                null, null, "Continue")
        ]),
    ], render));

    useEffect(() => {
        character.cars = [...character.cars, new Car(30000, new Date(gameState.s.date.getFullYear() - 3, random.int(0, 11), random.int(1, 28)), 20, 25, false, 180)];
        gameState.s.lifeEventScheduler = new LifeEventScheduler(lifeEventManager, gameState.s, [
            new LifeEventSchedule(new LifeEvent("Day Trading", new Date(),
                <DayTrading gameState={gameState.s}/>, true), 99, 5, .1, () => gameState.s.investmentsUnlocked),
            new LifeEventSchedule(new LifeEvent("Broken Laptop", new Date(),
                <BrokenLaptopEvent gameState={gameState.s}/>, true), 5, 4, .1, null
            ),
            new LifeEventSchedule(new LifeEvent("Promotion", new Date(), <PromotionEvent
                gameState={gameState.s}/>, true), 8, 4, .2, null),
        ]);
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
                } else if (lifeEventManager.getActiveEvent(gameState.s.date) != null && !lifeEventManager.getActiveEvent(gameState.s.date)!.customContinue) {
                    lifeEventManager.nextEvent();
                    e.stopImmediatePropagation();
                }
            } else if (e.key == "b") {
                if (document.getElementById("transfer-modal")!.style.display == "block") {
                    document.getElementById("transfer-cancel")!.click();
                    e.stopImmediatePropagation();
                } else if (document.getElementById("debt-modal")!.style.display == "block") {
                    document.getElementById("debt-cancel")!.click();
                    e.stopImmediatePropagation();
                } else if (tutorialManager.current.activeTutorial != null) {
                    // Don't change pages
                } else if (gameState.s.page < pages.length - 1) {
                    gameState.s.previousPage();
                    e.stopImmediatePropagation();
                }
            }
        });
    }, [])


    const pages = [
        {
            name: "Year in review",
            page: <div className="flex flex-col gap-1 items-center">
                <h1>Year in review {gameState.s.date.getFullYear() - 1}
                </h1>
                <div className="grid grid-cols-2 gap-4">
                    {character.accounts.filter(a => (a.name != "Investment Account" || gameState.s.investmentsUnlocked)
                        && (a.name != "Retirement Account" || gameState.s.retirementUnlocked)).map((account, i) => (
                        <div key={i} id={"YIRAccount" + account.name}
                             className="flex flex-col items-center bg-amber-100 rounded-xl p-4 gap-1 w-130 h-70">
                            <h3 className="text-gray-700 font-bold">{account.name}</h3>
                            <div className="flex items-baseline gap-2">
                                <p className="text-gray-700">{formatter.format(account.getTotalValue())}</p>
                                {account.diff ? account.diff >= 0 ? (
                                        <p className="text-green-700">+{account.diff}%</p>)
                                    : <p className="text-red-800">{account.diff}%</p> : <></>}
                            </div>
                            <LineChart
                                data={account.history}
                                index="dateString"
                                showLegend={false}
                                minValue={Math.min(0, Math.min(...account.history.map(h => h.balance)))}
                                maxValue={Math.max(...account.history.map(h => h.balance))}
                                aria-hidden="true"
                                categories={["balance"]}
                                valueFormatter={(number: number) => compactFormatter.format(number)}/>
                        </div>))}
                    <div id="DonutChart"
                         className="flex flex-col items-center bg-amber-100 rounded-xl p-4 gap-1 w-130 h-70">
                        <h3 className="text-gray-700 font-bold">Total Assets</h3>
                        <DonutChart
                            className="h-full w-full m-auto"
                            data={[
                                {
                                    name: "Cash",
                                    amount: character.accounts.reduce((sum, curr) => sum + curr.balance, 0)
                                },
                                {
                                    name: "Big-Ticket Item Allocations",
                                    amount: character.bigTicketItems.bigTicketItems.reduce((sum, curr) => sum + curr.balance, 0)
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
                                }, {
                                    name: "Assets",
                                    amount: character.cars.map(c => c.getBaseValue(gameState.s.date)).reduce((sum, curr) => sum + curr, 0)
                                }
                            ]}
                            label={formatter.format(character.getNetWorth(gameState.s.date))}
                            category="name" value="amount" showLabel={true}
                            valueFormatter={(number: number) => formatter.format(number)}/>
                    </div>
                </div>
            </div>,
            displayCondition: () => true,
        }, {
            name: "Budget",
            page: <div className="flex flex-col gap-2 items-center">
                <h1>Budget</h1>
                <div className="flex flex-col gap-2 w-3/5 rounded-2xl bg-amber-100 items-center p-2 pb-2">
                    <div className="grid grid-cols-3 w-full">
                        <p className="text-green-700 font-bold" id="Paycheck">Paycheck</p>
                        <p></p>
                        <p className="text-green-700 font-bold">{formatter.format(combinedSalary)}</p>
                        <hr></hr>
                        <hr></hr>
                        <hr></hr>

                        {gameState.s.retirementUnlocked ? [
                            <p className="text-gray-700" key={1}>Retirement</p>,
                            <p className="text-gray-700" key={2}>
                                <input name="character.pretirement" className="w-12 text-end"
                                       min="0"
                                       max={Math.min(24500 * gameState.s.inflation / combinedSalary * 100, 100)}
                                       defaultValue={character.pretirement}
                                       onChange={e => {
                                           if (isNaN(e.target.valueAsNumber)) return;
                                           character.pretirement = Math.min(1000, Math.max(0, e.target.valueAsNumber));
                                           render();
                                       }}
                                       type="number">
                                </input>%</p>,
                            <p className="text-gray-700"
                               key={3}>{formatter.format(combinedSalary * character.pretirement / 100)}</p>,
                        ] : []}


                        <p className="text-red-800" id="IncomeTaxes">Taxes <InfoButton
                            action={() => document.getElementById("tax-modal")!.style.display = "block"}/>
                        </p>
                        <p className="text-red-800">{Math.round(taxes / combinedSalary * 100)}%</p>
                        <p className="text-red-800">{formatter.format(taxes)}</p>

                        {Array.from(character.monthlyLivingExpenses.entries())
                            .map(([name, amount], i) => {
                                return ([
                                    <p className="text-red-800" key={i + "1"} id="ItemizedLivingExpenses">{name}</p>,
                                    <p className="text-red-800" key={i + "2"}>
                                        {Math.round(amount * 12 * gameState.s.inflation / combinedSalary * 100)}%</p>,
                                    <p className="text-red-800" key={i + "3"}>
                                        {formatter.format(amount * gameState.s.inflation * 12)}</p>
                                ]);
                            })}

                        <p className="text-red-800">Car maintenance cost</p>
                        <p className="text-red-800">{Math.round(gameState.s.character.cars.map(c => c.monthlyMaintenanceCost).reduce((sum, curr) => sum + curr, 0)
                            * 12 * gameState.s.inflation / combinedSalary * 100)}%</p>
                        <p className="text-red-800">{formatter.format(gameState.s.character.cars.map(c => c.monthlyMaintenanceCost).reduce((sum, curr) => sum + curr, 0)
                            * 12 * gameState.s.inflation)}</p>

                        {(gameState.s.character.cars.some(c => c.electric) ?
                            [<p className="text-red-800" key={1}>Car electricity cost</p>,
                                <p className="text-red-800" key={2}>
                                    {Math.round(gameState.s.character.milesDriven * gameState.s.character.cars.filter(c => c.electric).length / gameState.s.character.cars.length * 0.1833 * gameState.s.inflation * 12 / 3 / combinedSalary * 100)}%</p>,
                                <p className="text-red-800" key={3}>
                                    {formatter.format(gameState.s.character.milesDriven * gameState.s.character.cars.filter(c => c.electric).length / gameState.s.character.cars.length * 0.1833 * gameState.s.inflation * 12 / 3 * gameState.s.inflation)}</p>
                            ] : [])}
                        {(gameState.s.character.cars.some(c => !c.electric) ?
                            [
                                <p className="text-red-800" key={1}>Car gas cost</p>,
                                <p className="text-red-800" key={2}>
                                    {Math.round(gameState.s.character.milesDriven * gameState.s.character.cars.filter(c => !c.electric).length / gameState.s.character.cars.length * 3.2 * 12 * gameState.s.inflation
                                        / gameState.s.character.cars.filter(c => !c.electric).map(c => c.gpm).reduce((sum, curr) => sum + curr, 0) / gameState.s.character.cars.filter(c => !c.electric).length / combinedSalary * 100)}%</p>,
                                <p className="text-red-800" key={3}>
                                    {formatter.format(gameState.s.character.milesDriven * gameState.s.character.cars.filter(c => !c.electric).length / gameState.s.character.cars.length * 3.2 * 12 * gameState.s.inflation
                                        / gameState.s.character.cars.filter(c => !c.electric).map(c => c.gpm).reduce((sum, curr) => sum + curr, 0) / gameState.s.character.cars.filter(c => !c.electric).length)}</p>]
                            : [])}

                        <p className="text-red-800">Car insurance cost</p>
                        <p className="text-red-800">{Math.round(gameState.s.character.cars.map(c => c.monthlyInsuranceCost).reduce((sum, curr) => sum + curr, 0) * 12 * gameState.s.inflation / combinedSalary * 100)}%</p>
                        <p className="text-red-800">{formatter.format(gameState.s.character.cars.map(c => c.monthlyInsuranceCost).reduce((sum, curr) => sum + curr, 0) * 12 * gameState.s.inflation)}</p>

                        {character.loans.length > 0 ? [
                            <p className="text-red-800" key="111" id="Loans">Loans</p>,
                            <p className="text-red-800" key="222">{Math.round(ploans)}%</p>,
                            <p className="text-red-800" key="333">{formatter.format(minLoanPayments)}</p>
                        ] : []}

                        {gameState.s.bigTicketItemsUnlocked ? [
                            <p className="text-gray-700" key={1}>Big-Ticket Items</p>,
                            <p className="text-gray-700" key={2}>
                                {Math.round(character.bigTicketItems.getYearlyAllocation(gameState.s.date) / combinedSalary * 100)}%</p>,
                            <p className="text-gray-700" key={3}>
                                {formatter.format(character.bigTicketItems.getYearlyAllocation(gameState.s.date))}</p>,
                        ] : []}

                        {gameState.s.investmentsUnlocked ? [
                            <p className="text-gray-700" key={1}>Investments</p>,
                            <p className="text-gray-700" key={2}>
                                <input name="character.pinvestments" className="w-12 text-end"
                                       min="0"
                                       defaultValue={character.pinvestments}
                                       onChange={e => {
                                           if (isNaN(e.target.valueAsNumber)) return;
                                           character.pinvestments = Math.min(1000, Math.max(0, e.target.valueAsNumber));
                                           render();
                                       }}
                                       type="number">
                                </input>%</p>,
                            <p className="text-gray-700"
                               key={3}>{formatter.format(combinedSalary * character.pinvestments / 100)}</p>,
                        ] : []}

                        <p className="text-gray-700" id="Discretionary">Discretionary</p>
                        <p className="text-gray-700">
                            <input name="character.discretionary" className="w-12 text-end"
                                   min="0"
                                   defaultValue={character.pdiscretionary}
                                   onChange={e => {
                                       if (isNaN(e.target.valueAsNumber)) return;
                                       character.pdiscretionary = Math.min(1000, Math.max(0, e.target.valueAsNumber));
                                       render()
                                   }}
                                   type="number">
                            </input>%</p>
                        <p className="text-gray-700">{formatter.format(combinedSalary * character.pdiscretionary / 100)}</p>

                        <p className="text-gray-700" id="Vacation">Vacation</p>
                        <p className="text-gray-700">
                            <input name="character.ptrips" className="w-12 text-end"
                                   min="0"
                                   defaultValue={character.ptrips}
                                   onChange={e => {
                                       if (isNaN(e.target.valueAsNumber)) return;
                                       character.ptrips = Math.min(1000, Math.max(0, e.target.valueAsNumber));
                                       render()
                                   }}
                                   type="number">
                            </input>%</p>
                        <p className="text-gray-700">{formatter.format(combinedSalary * character.ptrips / 100)}</p>

                        <hr/>
                        <hr/>
                        <hr/>

                        <p className="text-yellow-600 font-bold" id="Savings">Savings</p>
                        <p className="text-yellow-600 font-bold">{Math.round(newSavings / combinedSalary * 100)}%</p>
                        <p className="text-yellow-600 font-bold">{formatter.format(newSavings)}</p>
                    </div>

                    <div className="flex gap-2">
                        <h3 className={newSavings > 0 ? "text-green-700" : "text-red-800"} id="PredictedBalance">
                            Predicted Balance: {formatter.format(character.savingsAccount.balance + newSavings)}</h3>
                    </div>
                </div>
            </div>,
            displayCondition: () => true,
        }, {
            name: "Loans",
            page: <div className="flex flex-col gap-2 items-center">
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
                    <div key={loan.name} id={"Loan" + loan.name}
                         className="flex flex-col items-center w-124 bg-amber-100 rounded-xl p-4 m-4 gap-1">
                        <h3 className="text-gray-700 font-bold">{loan.name}</h3>
                        <p className="text-gray-700">Interest Rate: {Math.round(loan.interestRate * 1000 - 1000) / 10}%
                            ({formatter.format(loan.balance * (loan.interestRate - 1) * (loan.fixed ? 1 : gameState.s.inflation))})</p>
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
            </div>,
            displayCondition: () => character.loans.length > 0,
        }, {
            name: "Big-Ticket Items",
            page: <div className="flex flex-col gap-2 items-center">
                <h1>Big-Ticket Items</h1>
                <BigTicketItemsPage gameState={gameState.s}/>
            </div>,
            displayCondition: () => gameState.s.bigTicketItemsUnlocked,
        }, {
            name: "Investments",
            page: <div className="flex flex-col gap-4 items-center">
                <h1>Investment Portfolio</h1>
                <h2 className="mt-2 text-yellow-600! font-bold" id="Uninvested">
                    Uninvested: {formatter.format(character.investmentAccount.balance)}
                </h2>
                <div id="IndexFund"><StockCard stock={indexFund.a} investmentAccount={character.investmentAccount}
                                               formatter={formatter}
                                               compactFormatter={compactFormatter} render={render}/></div>
                <div id="Bond"><StockCard stock={bond.a} investmentAccount={character.investmentAccount}
                                          formatter={formatter}
                                          compactFormatter={compactFormatter} render={render}/></div>
            </div>,
            displayCondition: () => gameState.s.investmentsUnlocked,
        }, {
            name: "Retirement",
            page: <div className="flex flex-col gap-4 items-center">
                <h1>Retirement Portfolio</h1>
                <h2 className="mt-2 text-yellow-600!">
                    Uninvested: {formatter.format(character.retirementAccount.balance)}
                </h2>
                <StockCard stock={indexFund.a} investmentAccount={character.retirementAccount} formatter={formatter}
                           compactFormatter={compactFormatter} render={render}/>
                <StockCard stock={bond.a} investmentAccount={character.retirementAccount} formatter={formatter}
                           compactFormatter={compactFormatter} render={render}/>
            </div>,
            displayCondition: () => gameState.s.retirementUnlocked,
        }, {
            name: "Summary",
            page: <div className="flex flex-col gap-2 items-center">
                <h1>Summary</h1>
                <div className="flex flex-col gap-2 w-1/2 rounded-2xl bg-amber-100 items-center pt-2 pb-2" id="summary">
                    <div className="grid grid-cols-2 gap-2 w-full">
                        <p className="text-gray-700" id="takeHomeIncomeText">Take home income</p>
                        <p className="text-gray-700">{formatter.format(combinedSalary - taxes)}</p>
                        <p className="text-gray-800" id="expensesText">Expenses</p>
                        <p className="text-gray-800">{formatter.format(livingExpenses + minLoanPayments)}</p>
                        <p className="text-red-800">Loans</p>
                        <p className="text-red-800">{formatter.format(character.totalLoans.balance)}</p>
                        {gameState.s.investmentsUnlocked ?
                            <>
                                <p className="text-gray-700">Investments</p>
                                <p className="text-gray-700">{formatter.format(character.investmentAccount.balance)}</p>
                            </>
                            : <></>}
                        {gameState.s.retirementUnlocked ?
                            <>
                                <p className="text-gray-700">Retirement</p>
                                <p className="text-gray-700">{formatter.format(character.retirementAccount.balance)}</p>
                            </>
                            : <></>}
                        <p className="text-gray-700">Predicted Balance</p>
                        <p className="text-gray-700">{formatter.format(character.savingsAccount.balance + newSavings)}</p>
                    </div>
                    <div className="flex w-full p-3">
                        <DonutChart
                            className="w-120 h-60 m-auto"
                            variant="pie"
                            data={[
                                {
                                    name: "Cash",
                                    amount: character.accounts.reduce((sum, curr) => sum + curr.balance, 0)
                                },
                                {
                                    name: "Big-Ticket Item Allocations",
                                    amount: character.bigTicketItems.bigTicketItems.reduce((sum, curr) => sum + curr.balance, 0)
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
                                }, {
                                    name: "Assets",
                                    amount: character.cars.map(c => c.getBaseValue(gameState.s.date)).reduce((sum, curr) => sum + curr, 0) + character.houseValue
                                }
                            ]}
                            label={formatter.format(character.getNetWorth(gameState.s.date))}
                            category="name" value="amount" showLabel={true}
                            valueFormatter={(number: number) => formatter.format(number)}/>
                        <LineChart
                            className="h-60 text-gray-700"
                            data={gameState.s.character.wealthHistory}
                            index="dateString"
                            minValue={Math.min(0, Math.min(...gameState.s.character.wealthHistory.map(h => Math.min(h.Assets, h.Debt, h.NetWorth))))}
                            maxValue={Math.max(...gameState.s.character.wealthHistory.map(h => Math.max(h.Assets, h.Debt, h.NetWorth)))}
                            aria-hidden="true"
                            categories={["NetWorth", "Assets", "Debt"]}
                            valueFormatter={(number: number) => compactFormatter.format(number)}/>
                    </div>
                    <h3 className="text-gray-700 p-2">
                        Total Net Worth: {formatter.format(character.getNetWorth(gameState.s.date))}
                    </h3>
                </div>
            </div>,
            displayCondition: () => true,
        }, {
            name: "Start Year",
            page: <div>
                {activeEvent == null ?
                    <>
                        <h1>Events</h1>
                        <button className="w-50 text-xl h-10 p-1 font-bold" onClick={() => nextYear()}><h3>End of
                            year</h3>
                        </button>
                    </> : <>
                        <h1 className="mb-2">{activeEvent.name}</h1>
                        {activeEvent.element}
                        {!activeEvent.customContinue ?
                            <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                    onClick={() => lifeEventManager.nextEvent()}>
                                <h3>Continue</h3>
                            </button> : <></>}
                    </>
                }
            </div>,
            displayCondition: () => true,
        },
    ];
    const pPage = (() => {
        if (page >= pages.length - 1) return null;
        for (let i = page - 1; i >= 0; i--) {
            if (pages[i].displayCondition()) return i;
        }
        return null;
    })();
    const nPage = (() => {
        for (let i = page + 1; i < pages.length; i++) {
            if (pages[i].displayCondition()) return i;
        }
        return null;
    })();
    const previousPage = () => {
        if (pPage == null) return;
        setPage(pPage);
    }

    const nextPage = () => {
        if (nPage == null) return;
        if (nPage == pages.length - 1) {
            startYear();
        }
        setPage(nPage);
    }

    gameState.s.page = page;
    gameState.s.pages = pages;
    gameState.s.nextPage = nextPage;
    gameState.s.previousPage = previousPage;
    gameState.s.render = render;
    gameState.s.switchToPage = (name: string) => {
        if (gameState.s.pages.some(p => p.name === name)) {
            setPage(gameState.s.pages.findIndex(p => p.name === name));
        }
    }
    gameState.s.lifeEventManager = lifeEventManager;
    return (
        <div>
            <button className="fixed left-1 mt-1 w-40 text-xl h-10 font-bold"
                    onClick={() => {
                        gameState.s.tutorial = !gameState.s.tutorial;
                        render();
                    }}>{gameState.s.tutorial ? "Tutorials" : "No Tutorials"}</button>
            <Outline gameState={gameState.s} page={page} startYear={startYear}/>
            {page < pages.length ?
                <SatisfactionNumber gameState={gameState.s} amount={character.satisfaction}/> : <></>}
            {pages[Math.min(page, pages.length - 1)].page}
            <div className="flex gap-2 justify-center mt-4">
                {pPage != null ?
                    <button className="w-24 text-xl h-10 p-1 font-bold" onClick={() => previousPage()}><h3>Back</h3>
                    </button>
                    : <></>}
                {nPage != null ?
                    <button className="w-70 text-xl h-10 p-1 font-bold" onClick={() => nextPage()}>
                        <h3>{nPage != pages.length - 1 ? "Next: " + pages[nPage].name : "Start the year"}</h3>
                    </button>
                    : <></>}
            </div>
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

                    <div className="flex flex-col items-center">
                        <div className="w-fit bg-gray-200 rounded-xl p-1 ">
                            <p className="text-xl text-gray-700! pl-1">$
                                <NumberInputAutoSelect
                                    className="w-40 text-gray-700"
                                    min={0}
                                    max={Math.min(transferTo.selectedAccount?.balance ?? 0, transferFrom.selectedAccount?.balance ?? 0)}
                                    disabled={transferFrom.selectedAccount == null}
                                    value={fundsToTransfer}
                                    onChange={e =>
                                        setFundsToTransfer(Math.min(Math.ceil(100 * Math.min(transferTo.selectedAccount?.balance ?? 0, transferFrom.selectedAccount?.balance ?? 0)) / 100, e.target.valueAsNumber))}>
                                </NumberInputAutoSelect>
                            </p>
                        </div>
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
                        styles={GetReactSelectStyle<Account>()}
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
                        styles={GetReactSelectStyle<Account>()}
                        onChange={(a: Account | null) => setTransferTo({selectedAccount: a})}></Select>

                    <div className="flex flex-col items-center">
                        <div className="w-fit bg-gray-200 rounded-xl p-1 ">
                            <p className="text-xl text-gray-700! pl-1">$
                                <NumberInputAutoSelect
                                    className="w-40 text-gray-700"
                                    min={0}
                                    max={transferFrom.selectedAccount?.balance ?? 0}
                                    disabled={transferFrom.selectedAccount == null}
                                    value={fundsToTransfer}
                                    onChange={e => {
                                        if (isNaN(e.target.valueAsNumber)) return;
                                        setFundsToTransfer(Math.min(Math.ceil(100 * (transferFrom.selectedAccount?.balance ?? 0)) / 100, e.target.valueAsNumber))
                                    }}>
                                </NumberInputAutoSelect>
                            </p>
                        </div>
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

            <div id="goals-modal" className="flex hmodal justify-center"
                 onClick={() => {
                     document.getElementById("goals-modal")!.style.display = "none";
                     setSelectedGoal("");
                 }}>
                <div
                    className="flex flex-col gap-2 ml-auto mr-auto mt-[10%] w-120 bg-amber-100 rounded-xl items-center p-4"
                    onClick={e => e.stopPropagation()}>
                    <h2 className="text-gray-700!">Goals</h2>
                    {character.goals.map(goal =>
                        (<div key={goal.name + goal.targetDate.toString()}
                              className="eventButton w-full! bg-gray-200! cursor-pointer"
                              onClick={() => {
                                  setSelectedGoal(pg => pg === goal.name ? "" : goal.name);
                              }}>
                            <div className="grid grid-cols-2 p-1">
                                <h3 className="text-gray-700 text-start font-bold">{goal.name}</h3>

                                <p className="text-gray-700 text-end">Years until
                                    due: {goal.targetDate.getFullYear() - gameState.s.date.getFullYear()}</p>
                            </div>
                            {selectedGoal === goal.name ?
                                <p className="text-gray-700">
                                    {goal.description}
                                </p> : <></>}
                        </div>))
                    }
                    <button
                        onClick={() => {
                            document.getElementById("goals-modal")!.style.display = "none";
                            setSelectedGoal("");
                        }}
                        className="p-2 text-2xl w-80">Close
                    </button>
                </div>
            </div>
            <div id="tax-modal" className="flex hmodal justify-center"
                 onClick={() => document.getElementById("tax-modal")!.style.display = "none"}>
                <div
                    className="flex flex-col gap-2 ml-auto mr-auto mt-[10%] w-180 bg-amber-100 rounded-xl items-center p-4"
                    onClick={e => e.stopPropagation()}>
                    <h2 className="text-gray-700!">Taxable Income <InfoButtonTooltip
                        action={() => window.open("https://www.irs.gov/credits-and-deductions", "_blank")}
                        text="Your taxable income is your salary minus any money put into a traditional retirement account, any credits and deductions"/>
                    </h2>
                    <p className="text-gray-700">{formatter.format(taxableIncome)}</p>
                    <h2 className="text-gray-700!">{(character.partnerFirstName ? "Married" : "Single")} Tax
                        Brackets <InfoButtonTooltip
                            action={() => window.open("https://www.irs.gov/filing/federal-income-tax-rates-and-brackets", "_blank")}
                            text="See actual tax brackets at the IRS webpage"/>
                    </h2>
                    <div className="grid grid-cols-4 w-full">
                        <p className="text-gray-700">Percent</p>
                        <p className="text-gray-700">From</p>
                        <p className="text-gray-700">To</p>
                        <p className="text-gray-700">Taxed</p>
                        <hr/>
                        <hr/>
                        <hr/>
                        <hr/>
                        {(character.partnerFirstName ? marriedTaxBrackets : singleTaxBrackets).map((b, i) => [
                                <p className="text-gray-700" key={i + "1"}>{b.percent}%</p>,
                                <p className="text-gray-700"
                                   key={i + "2"}>{formatter.format(i == 0 ? 0 : (character.partnerFirstName ? marriedTaxBrackets : singleTaxBrackets)[i - 1].to * gameState.s.inflation + 1)}</p>,
                                <p className="text-gray-700"
                                   key={i + "3"}>{b.to > 700350 ? "" : formatter.format(b.to * gameState.s.inflation)}</p>,
                                <p className="text-gray-700"
                                   key={i + "4"}>{formatter.format(Math.max(0, (Math.min(taxableIncome, b.to * gameState.s.inflation) - (i == 0 ? 0 : (character.partnerFirstName ? marriedTaxBrackets : singleTaxBrackets)[i - 1].to * gameState.s.inflation + 1)) * b.percent / 100))}</p>
                            ]
                        )}
                    </div>
                    <p className="text-gray-700">Total Taxes: {formatter.format(taxes)}</p>
                    <p className="text-gray-700 italic">(number are adjusted to in-game inflation)</p>
                    <button
                        onClick={() => document.getElementById("tax-modal")!.style.display = "none"}
                        className="p-2 text-2xl w-80">Close
                    </button>
                </div>
            </div>
            {/* eslint-disable-next-line react-hooks/refs */}
            {tutorialManager.current.getTutorialElement()}
            <div className="mb-20"></div>
            <div id="BottomBar"
                 className="fixed bottom-1 left-1 z-9 h-16 right-1 justify-center p-2 rounded-2xl bg-amber-100">
                <div className="grid grid-cols-4 content-center align-items-middle mx-auto h-full ml-4 mr-4">
                    <h2 className="text-gray-700! align-self-middle text-start w-100">{fname} {lname} ({character.age})</h2>
                    {(page < pages.length ? [
                            <BalanceNumber gameState={gameState.s} amount={character.savingsAccount.balance} key="1"/>,
                            (gameState.s.character.accounts.length > 1 ?
                                <button className="w-50 ml-4 text-xl font-bold h-10 justify-self-left" key="2"
                                        onClick={() => {
                                            setFundsToTransfer(0);
                                            setTransferFrom({selectedAccount: null});
                                            setTransferTo({selectedAccount: null});
                                            document.getElementById("transfer-modal")!.style.display = "block";
                                            document.getElementById("debt-modal")!.style.display = "none";
                                        }}>
                                    Transfer Money
                                </button>
                                : <div key="2"></div>)]
                        : [<div key="1"></div>, <div key="2"></div>])}
                    <h2 className="justify-self-end text-gray-700!">{GetDateString(gameState.s.date)}</h2>
                </div>
            </div>
        </div>
    );
}

export default GamePage