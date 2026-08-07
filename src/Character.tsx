import {Account, GameState, Loan, StockAccount} from "./Data.tsx";
import {LifeEvent, type LifeEventManager} from "./EventManager.tsx";
import {CarShop} from "./events/CarShop.tsx";
import random from "random";
import {ButtonNext} from "./Utils.tsx";

export class Character {
    firstName: string;
    lastName: string;
    salary: number;
    pinvestments: number;
    pretirement: number;
    pdiscretionary: number;
    ptrips: number;
    accounts: Account[];
    loans: Loan[];
    totalLoans: Account;
    satisfaction: number;
    monthlyLivingExpenses: Map<string, number>;
    age: number;
    savingsAccount: Account;
    bigTicketItems: BigTicketItems;
    goals: Goal[];
    investmentAccount: StockAccount;
    retirementAccount: StockAccount;
    tripBalance: number;
    taxableIncome: number;
    previousYearlyBalance: number;
    cars: Car[];
    milesDriven: number;
    wealthHistory: { date: Date, dateString: string, NetWorth: number, Assets: number, Debt: number }[];
    partnerAspiration: string;
    partnerSalary: number;
    partnerFirstName: string | null;
    partnerLastName: string | null;
    partnerAge: number | null;
    partnerPronoun: string | null;
    partnerPronoun2: string | null;
    education: string;
    housing: string;
    houseValue: number;
    housingDesc: string;

    constructor(firstName: string, lastName: string, monthlyLivingExpenses: {
        name: string,
        amount: number
    }[], age: number) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.salary = 0;
        this.pinvestments = 0;
        this.pretirement = 0;
        this.pdiscretionary = 0;
        this.ptrips = 0;
        this.loans = [];
        this.totalLoans = new Account("Loans", 0, false);
        this.satisfaction = 0;
        this.monthlyLivingExpenses = new Map();
        monthlyLivingExpenses.forEach(m => this.monthlyLivingExpenses.set(m.name, m.amount));
        this.age = age;
        this.savingsAccount = new Account("Savings Account", 0, true);
        this.accounts = [this.savingsAccount];
        this.bigTicketItems = new BigTicketItems(this);
        this.goals = [];
        this.investmentAccount = new StockAccount("Investment Account", 0);
        this.retirementAccount = new StockAccount("Retirement Account", 0);
        this.tripBalance = 0;
        this.taxableIncome = 0;
        this.previousYearlyBalance = 0;
        this.cars = [];
        this.milesDriven = 300;
        this.wealthHistory = [];
        this.partnerAspiration = "";
        this.partnerSalary = 0;
        this.partnerFirstName = null;
        this.partnerLastName = null;
        this.partnerAge = null;
        this.partnerPronoun = null;
        this.partnerPronoun2 = null;
        this.education = "High School";
        this.housing = "Apartment";
        this.houseValue = 0;
        this.housingDesc = "1 bedroom 1 bathroom";
    }

    checkGoals(gameState: GameState) {
        const achievedGoals = this.goals.filter(g => g.condition(gameState, g));
        achievedGoals.forEach(g => g.onCompleted(gameState, g));
        this.goals = this.goals.filter(g => !achievedGoals.includes(g));
    }

    checkGoalOfName(gameState: GameState, name: string) {
        if (!this.goals.some(g => g.name == name)) return;
        const goal = this.goals.find(g => g.name == name)!;
        if (goal.condition(gameState, goal)) {
            this.goals = this.goals.filter(g => g != goal);
            goal.onCompleted(gameState, goal)
        }
    }

    endYear(gameState: GameState, inflation: number) {
        this.salary *= inflation;
        this.partnerSalary *= inflation;
        this.loans.forEach(l => l.endLoanYear(gameState.date, inflation));
        this.accounts.forEach((account) => account.endYear(gameState.date));
        this.refreshLoans();
        this.totalLoans.endYear(gameState.date);
        this.cars.forEach(c => {
            c.monthlyInsuranceCost *= 0.95 * inflation;
            c.monthlyMaintenanceCost *= 1.1 * inflation;
            c.cost *= inflation;
        });
        this.houseValue *= inflation;
        this.age++;
        this.wealthHistory = [...this.wealthHistory,
            {
                date: gameState.date,
                dateString: gameState.date.getFullYear().toString(),
                NetWorth: this.getNetWorth(gameState.date),
                Assets: this.getAssetValue(gameState.date),
                Debt: this.totalLoans.balance
            }];
    }

    addLoan(loan: Loan) {
        this.totalLoans.balance += loan.balance;
        if (this.loans.some(l => l.name == loan.name)) {
            this.loans.find(l => l.name == loan.name)!.balance += loan.balance;
            return;
        }
        this.loans = [...this.loans, loan];
    }

    addCreditDebt(amount: number) {
        const loan = this.loans.find((l) => l.name == "Credit Card Debt");
        if (loan) {
            loan.balance += amount;
        } else {
            this.addLoan(new Loan("Credit Card Debt", amount, this.savingsAccount, 1.27, false));
        }
    }

    addMoney(amount: number) {
        this.savingsAccount.balance += amount;
        if (this.savingsAccount.balance < 0) {
            this.addCreditDebt(-this.savingsAccount.balance);
            this.savingsAccount.balance = 0;
        }
    }

    payMoney(amount: number) {
        this.savingsAccount.balance -= amount;
        if (this.savingsAccount.balance < 0) {
            this.addCreditDebt(-this.savingsAccount.balance);
            this.savingsAccount.balance = 0;
        }
    }

    refreshLoans() {
        this.loans = this.loans.filter(l => l.balance >= 0.01);
        this.totalLoans.balance = this.loans.reduce((sum, a) => sum + a.balance, 0);
    }

    addGoal(goal: Goal) {
        this.goals = [...this.goals, goal];
    }

    getOldestCar() {
        return this.cars.sort((a, b) => a.buyDate.getTime() - b.buyDate.getTime())[0];
    }

    getMonthlyCarCosts() {
        let totalCost = 0;
        this.cars.forEach(c => {
            let fuelCost: number;
            if (c.electric) fuelCost = this.milesDriven * 0.183 / 3 / this.cars.length;
            else fuelCost = this.milesDriven * 3.2 / c.gpm / this.cars.length;

            totalCost += fuelCost + c.monthlyInsuranceCost + c.monthlyMaintenanceCost;
        });
        return totalCost;
    }

    getAssetValue(date: Date) {
        return this.accounts.reduce((sum, curr) => sum + curr.getTotalValue(), 0)
            + this.bigTicketItems.bigTicketItems.reduce((sum, curr) => sum + curr.balance, 0)
            + this.cars.map(c => c.getBaseValue(date)).reduce((sum, curr) => sum + curr, 0)
            + this.houseValue;
    }

    getNetWorth(date: Date) {
        return this.getAssetValue(date) - this.totalLoans.balance;
    }

    scheduleTrips(gameState: GameState) {
        let expensiveTrips = 0;
        let cheapTrips = 0;
        while (this.tripBalance >= 800 * (this.isMarried() ? 2 : 1) * gameState.inflation) {
            if (this.tripBalance >= 2000 * (this.isMarried() ? 2 : 1) * gameState.inflation) {
                expensiveTrips++;
                this.tripBalance -= 2000 * (this.isMarried() ? 2 : 1) * gameState.inflation;
                continue;
            }
            cheapTrips++;
            this.tripBalance -= 800 * (this.isMarried() ? 2 : 1) * gameState.inflation;
        }
        let locations = ["Rome", "Tokyo", "Prague", "Swiss Alps", "Mauritius", "Machu Picchu", "Palawan", "Bora Bora", "Tanzania", "Sydney", "Paris", "Chiang Mai", "Maui", "Barcelona", "London", " England", "Great Barrier Reef", "Cappadocia", "Istanbul", "Glacier National Park", "Saint Lucia", "Yellowstone National Park", "South Island", " New Zealand", "Maldives", "Quebec City", "Banff", "Turks & Caicos"];

        for (let i = 0; i < expensiveTrips; i++) {
            const location = random.int(0, locations.length - 1);
            gameState.lifeEventManager!.addEvent(new LifeEvent("Expensive Trip",
                new Date(gameState.date.getFullYear(), random.int(0, 11), random.int(1, 28), 12),
                <div>
                    <h3>You flew to {locations[location]} for your vacation!</h3>
                    <ButtonNext
                        style="w-50 text-xl h-10 p-1 font-bold mt-2"
                        text="Relaxing!"
                        action={() => {
                            gameState.character.satisfaction += random.int(2, 4);
                            gameState.lifeEventManager!.nextEvent();
                        }}/>
                </div>, true))
            locations = locations.filter((_, i) => i != location);
        }

        let activities = ["camping", "kayaking", "canoeing", "sightseeing", "hiking", "biking"];
        for (let i = 0; i < cheapTrips; i++) {
            const activity = random.int(0, activities.length - 1);
            gameState.lifeEventManager!.addEvent(new LifeEvent("Road Trip",
                new Date(gameState.date.getFullYear(), random.int(0, 11), random.int(1, 28), 12),
                <div>
                    <h3>You went {activities[activity]}!</h3>
                    <ButtonNext
                        style="w-50 text-xl h-10 p-1 font-bold mt-2"
                        text="That was fun!"
                        action={() => {
                            gameState.character.satisfaction += Math.round(Math.sqrt(random.float(.4, 3)));
                            gameState.lifeEventManager!.nextEvent();
                        }}/>
                </div>, true))
            activities = activities.filter((_, i) => i != activity);
        }
    }

    isMarried() {
        return this.partnerFirstName != null;
    }

    isRenting() {
        return this.housing == "Apartment";
    }
}

export class BigTicketItem {
    name: string;
    desc: string;
    buyDate: Date;
    fullCost: number
    targetBalance: number;
    loanPercent: number
    balance: number;

    constructor(name: string, desc: string, buyDate: Date, fullCost: number, targetBalance: number, loanPercent: number, balance: number) {
        this.name = name;
        this.desc = desc;
        this.buyDate = buyDate;
        this.fullCost = fullCost;
        this.targetBalance = targetBalance;
        this.loanPercent = loanPercent;
        this.balance = balance;
    }
}

export class BigTicketItems {
    bigTicketItems: BigTicketItem [] = [];
    character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    addBigTicketItem(name: string, desc: string, buyDate: Date, fullCost: number, targetBalance: number, loanPercent: number) {
        this.bigTicketItems = [...this.bigTicketItems, {
            name: name,
            desc: desc,
            buyDate: buyDate,
            fullCost: fullCost,
            targetBalance: targetBalance,
            loanPercent: loanPercent,
            balance: 0
        }];
    }

    removeBigTicketItem(bigTicketItem: BigTicketItem) {
        this.character.addMoney(bigTicketItem.balance);
        this.bigTicketItems = this.bigTicketItems.filter(bt => bt != bigTicketItem);
    }

    getYearlyAllocation(date: Date) {
        return this.bigTicketItems
            .filter(bt => bt.buyDate.getFullYear() > date.getFullYear())
            .reduce((sum, bt) =>
                sum + (bt.targetBalance - bt.balance) / (bt.buyDate.getFullYear() - date.getFullYear()), 0);
    }

    doYearlyAllocations(date: Date) {
        this.bigTicketItems.forEach(bt =>
            bt.balance += (bt.targetBalance - bt.balance) / (bt.buyDate.getFullYear() - date.getFullYear()));
    }

    scheduleBigTicketItems(lifeEventManager: LifeEventManager, gameState: GameState, date: Date) {
        this.bigTicketItems.forEach(bt => {
            if (bt.buyDate.getFullYear() <= date.getFullYear()) {
                lifeEventManager.addEvent(new LifeEvent(bt.name, bt.buyDate,
                    <div>
                        <p>{bt.desc}</p>
                        <div className="flex flex-col items-center w-full">
                            <CarShop gameState={gameState}
                                     action={(gameState: GameState) => gameState.lifeEventManager!.nextEvent()}
                                     allocatedMoney={bt.balance}
                            />
                        </div>
                    </div>, true));
            }
        });
        this.bigTicketItems = this.bigTicketItems.filter(bt => bt.buyDate.getFullYear() > date.getFullYear());
    }
}

export class Goal {
    name: string;
    description: string;
    targetDate: Date;
    condition: (gameState: GameState, goal: Goal) => boolean;
    onCompleted: (gameState: GameState, goal: Goal) => void;

    constructor(name: string, description: string, targetDate: Date, condition: (gameState: GameState, goal: Goal) => boolean, onCompleted: (gameState: GameState, goal: Goal) => void) {
        this.name = name;
        this.description = description;
        this.targetDate = targetDate;
        this.condition = condition;
        this.onCompleted = onCompleted;
    }
}

export class Car {
    cost: number;
    buyDate: Date;
    monthlyMaintenanceCost: number;
    gpm: number;
    electric: boolean;
    monthlyInsuranceCost: number;
    image: string;

    constructor(cost: number, buyDate: Date, monthlyMaintenanceCost: number, gpm: number, electric: boolean, monthlyInsuranceCost: number, image: string) {
        this.cost = cost;
        this.buyDate = buyDate;
        this.monthlyMaintenanceCost = monthlyMaintenanceCost;
        this.gpm = gpm;
        this.electric = electric;
        this.monthlyInsuranceCost = monthlyInsuranceCost;
        this.image = image;
    }

    getAvgExpirationDate() {
        return new Date(this.buyDate.getFullYear() + 10, this.buyDate.getMonth(), this.buyDate.getDate());
    }

    getBaseValue(date: Date) {
        return this.cost / ((date.getFullYear() - this.buyDate.getFullYear()) / 5 + 1)
    }

    getSellValue(date: Date) {
        return this.getBaseValue(date) / 2;
    }
}