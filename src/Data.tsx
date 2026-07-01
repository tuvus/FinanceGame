import {type LifeEventManager, LifeEventScheduler} from "./EventManager.tsx";

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
    investmentAccount: StockAccount;
    retirementAccount: StockAccount;
    taxableIncome: number;

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
        this.investmentAccount = new StockAccount("Investment Account", 0);
        this.retirementAccount = new StockAccount("Retirement Account", 0);
        this.taxableIncome = 0;
    }

    endYear(date: Date, inflation: number) {
        this.salary *= inflation;
        this.loans.forEach(l => l.endLoanYear(date, inflation));
        this.accounts.forEach((account) => account.endYear(date));
        this.refreshLoans();
        this.totalLoans.endYear(date);
        this.age++;
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

    refreshLoans() {
        this.loans = this.loans.filter(l => l.balance >= 0.01);
        this.totalLoans.balance = this.loans.reduce((sum, a) => sum + a.balance, 0);
    }
}

export class Account {
    name: string;
    balance: number;
    diff: number | undefined;
    history: { date: Date, dateString: string, balance: number }[];
    isOwnedAccount: boolean;

    constructor(name: string, balance: number, isOwnedAccount: boolean) {
        this.name = name;
        this.balance = balance;
        this.diff = undefined;
        this.history = [];
        this.isOwnedAccount = isOwnedAccount;
    }

    getDateString(date: Date) {
        if (date.getMonth() == 0) {
            return date.getFullYear().toString();
        }
        return date.getMonth().toString();
    }

    endYear(date: Date): void {
        this.history = [...this.history, {
            date: date,
            dateString: this.getDateString(date),
            balance: this.getTotalValue()
        }];
        if (this.history.length > 1)
            this.diff = Math.floor((this.history[this.history.length - 1].balance - this.history[this.history.length - 2].balance) / Math.abs(this.history[this.history.length - 2].balance) * 100);
        else this.diff = 0;
    }

    getTotalValue(): number {
        return this.balance;
    }
}

export class StockBond extends Account {
    bond: boolean;

    constructor(name: string, balance: number, bond: boolean) {
        super(name, balance, false);
        this.bond = bond;
    }
}

export class StockAccount extends Account {
    positions: Map<StockBond, { amount: number, buyValue: number }>;

    constructor(name: string, balance: number) {
        super(name, balance, true);
        this.positions = new Map<StockBond, { amount: number, buyValue: number }>();
    }

    addStock(stock: StockBond, amount: number) {
        this.positions.set(stock, {
            amount: (amount + (this.positions.get(stock)?.amount ?? 0)),
            buyValue: (this.positions.has(stock) ?
                ((amount * stock.balance + this.positions.get(stock)!.amount * this.positions.get(stock)!.buyValue)
                    / (amount + this.positions.get(stock)!.amount))
                : stock.balance)
        });
    }

    removeStock(stock: StockBond, amount: number) {
        this.positions.set(stock, {
            amount: (this.positions.get(stock)?.amount ?? 0) - amount,
            buyValue: (this.positions.get(stock)?.buyValue ?? 0)
        });
        if (this.positions.get(stock)!.amount < 0.00001)
            this.positions.delete(stock);
    }

    getStock(stock: StockBond) {
        return this.positions.get(stock) ?? {amount: 0, buyValue: 0};
    }

    getTotalValue() {
        return this.balance + [...this.positions.entries()].map(e => e[0].balance * e[1].amount)
            .reduce((sum, current) => sum + current, 0);
    }

    getStockValue() {
        return [...this.positions.entries()].filter(a => !a[0].bond).map(e => e[0].balance * e[1].amount)
            .reduce((sum, current) => sum + current, 0);
    }

    getGains() {
        return [...this.positions.entries()].filter(a => !a[0].bond).map(e => (e[0].balance - e[1].buyValue) * e[1].amount)
            .reduce((sum, current) => sum + current, 0);
    }

    getBondValue() {
        return [...this.positions.entries()].filter(a => a[0].bond).map(e => e[0].balance * e[1].amount)
            .reduce((sum, current) => sum + current, 0);
    }
}

export class Loan extends Account {
    linkedAccount: Account;
    interestRate: number;
    minimumPayment: number;
    setPayment: number;
    fixed: boolean;

    constructor(name: string, balance: number, linkedAccount: Account, interestRate: number, fixed: boolean) {
        super(name, balance, false);
        this.linkedAccount = linkedAccount;
        this.interestRate = interestRate;
        this.minimumPayment = balance * (interestRate * 1.1 - 1);
        this.setPayment = this.minimumPayment;
        this.fixed = fixed;
    }

    endLoanYear(date: Date, inflation: number): void {
        this.balance *= inflation;
        if (!this.fixed) this.balance *= this.interestRate;
        const toTransfer = Math.min(this.getPayment(), this.linkedAccount.balance);
        this.linkedAccount.balance -= toTransfer;
        this.balance -= toTransfer;
        super.endYear(date);
        if (this.balance < 0.00001) return;
        // Todo: find a better formula for not paying the minimum due
        if (toTransfer < this.minimumPayment) this.balance += (this.minimumPayment - toTransfer) * 2;
    }

    getPayment(): number {
        return Math.min(this.balance, this.setPayment);
    }
}

export class GameState {
    page: number = 0;
    date: Date;
    // The number of years the player has played, 0 is when choosing college, 1 is the first year they allocate for and so on
    gameYear: number = 0;
    character: Character;
    formatter: Intl.NumberFormat;
    compactFormatter: Intl.NumberFormat;
    lifeEventManager: LifeEventManager | null;
    lifeEventScheduler: LifeEventScheduler | null;
    investmentsUnlocked: boolean = false;
    retirementUnlocked: boolean = false;

    constructor(date: Date, character: Character, formatter: Intl.NumberFormat, compactFormatter: Intl.NumberFormat) {
        this.date = date;
        this.character = character;
        this.formatter = formatter;
        this.compactFormatter = compactFormatter;
        this.lifeEventManager = null;
        this.lifeEventScheduler = null
    }

    nextPage = (): void => {
    };
    previousPage = (): void => {
    };
}