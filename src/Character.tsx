import {Account, GameState, Loan, StockAccount} from "./Data.tsx";
import {LifeEvent, type LifeEventManager} from "./EventManager.tsx";
import {CarShop} from "./components/CarShop.tsx";

export class Character {
    firstName: string;
    lastName: string;
    salary: number;
    pinvestments: number;
    pretirement: number;
    pleisure: number;
    accounts: Account[];
    loans: Loan[];
    totalLoans: Account;
    satisfaction: number;
    monthlyLivingExpenses: { name: string, amount: number }[];
    age: number;
    savingsAccount: Account;
    bigTicketItems: BigTicketItems;
    goals: Goal[];
    investmentAccount: StockAccount;
    retirementAccount: StockAccount;
    taxableIncome: number;
    previousYearlyBalance: number;
    car: Car;
    milesDriven: number;

    constructor(firstName: string, lastName: string, monthlyLivingExpenses: {
        name: string,
        amount: number
    }[], age: number) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.salary = 0;
        this.pinvestments = 0;
        this.pretirement = 0;
        this.pleisure = 0;
        this.accounts = [];
        this.loans = [];
        this.totalLoans = new Account("Loans", 0, false);
        this.satisfaction = 0;
        this.monthlyLivingExpenses = monthlyLivingExpenses;
        this.age = age;
        this.savingsAccount = new Account("Savings Account", 0, true);
        this.bigTicketItems = new BigTicketItems(this);
        this.goals = [];
        this.investmentAccount = new StockAccount("Investment Account", 0);
        this.retirementAccount = new StockAccount("Retirement Account", 0);
        this.taxableIncome = 0;
        this.previousYearlyBalance = 0;
        this.car = new Car(30000, new Date(1, 1), 1, 1, 1);
        this.milesDriven = 300;
    }

    checkGoals(gameState: GameState) {
        const achievedGoals = this.goals.filter(g => g.condition(gameState, g));
        achievedGoals.forEach(g => g.onCompleted(gameState, g));
        this.goals = this.goals.filter(g => !achievedGoals.includes(g));
    }

    checkGoalOfName(gameState: GameState, name: string) {
        console.log("TESTING1")
        if (!this.goals.some(g => g.name == name)) return;
        console.log("TESTING2")
        const goal = this.goals.find(g => g.name == name)!;
        if (goal.condition(gameState, goal)) {
            this.goals = this.goals.filter(g => g != goal);
            goal.onCompleted(gameState, goal)
        }
    }

    endYear(gameState: GameState, inflation: number) {
        this.salary *= inflation;
        this.loans.forEach(l => l.endLoanYear(gameState.date, inflation));
        this.accounts.forEach((account) => account.endYear(gameState.date));
        this.refreshLoans();
        this.totalLoans.endYear(gameState.date);
        this.car.monthlyMaintenanceCost *= 1.3;
        this.car.monthlyInsuranceCost *= 0.95;
        this.age++;
        this.checkGoals(gameState);
    }

    addLoan(loan: Loan) {
        this.loans = [...this.loans, loan];
        this.totalLoans.balance += loan.balance;
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

    getMonthlyCarCosts() {
        return this.milesDriven * 3.2 / this.car.gpm + this.car.monthlyInsuranceCost + this.car.monthlyMaintenanceCost;
    }
}

export class BigTicketItem {
    name: string;
    desc: string;
    buyDate: Date;
    fullCost: number
    targetBalance: number;
    balance: number;

    constructor(name: string, desc: string, buyDate: Date, fullCost: number, targetBalance: number, balance: number) {
        this.name = name;
        this.desc = desc;
        this.buyDate = buyDate;
        this.fullCost = fullCost;
        this.targetBalance = targetBalance;
        this.balance = balance;
    }
}

export class BigTicketItems {
    bigTicketItems: BigTicketItem [] = [];
    character: Character;

    constructor(character: Character) {
        this.character = character;
    }

    AddBigTicketItem(name: string, desc: string, buyDate: Date, fullCost: number, targetBalance: number) {
        this.bigTicketItems = [...this.bigTicketItems, {
            name: name,
            desc: desc,
            buyDate: buyDate,
            fullCost: fullCost,
            targetBalance: targetBalance,
            balance: 0
        }];
    }

    RemoveBigTicketItem(bigTicketItem: BigTicketItem) {
        this.character.addMoney(bigTicketItem.balance);
        this.bigTicketItems = this.bigTicketItems.filter(bt => bt != bigTicketItem);
    }

    GetYearlyAllocation(date: Date) {
        return this.bigTicketItems
            .filter(bt => bt.buyDate.getFullYear() > date.getFullYear())
            .reduce((sum, bt) =>
                sum + (bt.targetBalance - bt.balance) / (bt.buyDate.getFullYear() - date.getFullYear()), 0);
    }

    DoYearlyAllocations(date: Date) {
        this.bigTicketItems.forEach(bt =>
            bt.balance += (bt.targetBalance - bt.balance) / (bt.buyDate.getFullYear() - date.getFullYear()));
    }

    ScheduleBigTicketItems(lifeEventManager: LifeEventManager, gameState: GameState, date: Date) {
        this.bigTicketItems.forEach(bt => {
            if (bt.buyDate.getFullYear() <= date.getFullYear()) {
                lifeEventManager.AddEvent(new LifeEvent(bt.name, bt.buyDate,
                    <div>
                        <p>{bt.desc}</p>
                        <div className="flex flex-col items-center w-full">
                            <CarShop gameState={gameState}
                                     action={(gameState: GameState) => gameState.lifeEventManager!.NextEvent()}
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
    monthlyInsuranceCost: number;

    constructor(cost: number, buyDate: Date, monthlyMaintenanceCost: number, gpm: number, monthlyInsuranceCost: number) {
        this.cost = cost;
        this.buyDate = buyDate;
        this.monthlyMaintenanceCost = monthlyMaintenanceCost;
        this.gpm = gpm;
        this.monthlyInsuranceCost = monthlyInsuranceCost;
    }

    getAvgExpirationDate() {
        return new Date(this.buyDate.getFullYear() + 10, this.buyDate.getMonth(), this.buyDate.getDate());
    }
}