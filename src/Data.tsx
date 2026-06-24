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

    constructor(firstName: string, lastName: string, monthlyLivingExpenses: { name: string, amount: number }[], age: number) {
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
            return "1/" + date.getFullYear();
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

    constructor(date: Date) {
        this.date = date;
    }

    nextPage = (): void => {
    };
    previousPage = (): void => {
    };
}