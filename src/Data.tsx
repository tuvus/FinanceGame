export class Character {
    firstName: string;
    lastName: string;
    salary: number;
    accounts: Account[];
    loans: Loan[];
    totalLoans: Account;

    constructor(firstName: string, lastName: string, date: Date) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.salary = 0;
        this.accounts = [];
        this.loans = [];
        this.totalLoans = new Account("Loans", 0, date, false);
    }

    endYear(date: Date, inflation: number) {
        this.salary *= inflation;
        this.accounts.forEach((account) => account.endYear(date));
        this.loans.forEach(l => l.endLoanYear(date, inflation));
        this.refreshLoans();
        this.totalLoans.endYear(date);
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

    constructor(name: string, balance: number, date: Date, isOwnedAccount: boolean) {
        this.name = name;
        this.balance = balance;
        this.diff = undefined;
        this.history = [{date: date, dateString: this.getDateString(date), balance: balance}];
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
        this.diff = Math.floor((this.history[this.history.length - 1].balance - this.history[this.history.length - 2].balance) / Math.abs(this.history[this.history.length - 2].balance) * 100);
    }

    getTotalValue(): number {
        return this.balance;
    }
}

export class StockBond extends Account {
    bond: boolean;

    constructor(name: string, balance: number, date: Date, bond: boolean) {
        super(name, balance, date, false);
        this.bond = bond;
    }
}

export class StockAccount extends Account {
    positions: Map<StockBond, number>;

    constructor(name: string, balance: number, date: Date) {
        super(name, balance, date, true);
        this.positions = new Map<StockBond, number>();
    }

    addStock(stock: StockBond, amount: number) {
        this.positions.set(stock, amount + (this.positions.get(stock) ?? 0));
    }

    removeStock(stock: StockBond, amount: number) {
        this.positions.set(stock, amount - (this.positions.get(stock) ?? 0));
        if (this.positions.get(stock)! < 0.00001)
            this.positions.delete(stock);
    }

    getStock(stock: StockBond) {
        return this.positions.get(stock) ?? 0;
    }

    getTotalValue() {
        return this.balance + [...this.positions.entries()].map(e => e[0].balance * e[1])
            .reduce((sum, current) => sum + current, 0);
    }

    getStockValue() {
        return [...this.positions.entries()].filter(a => !a[0].bond).map(e => e[0].balance * e[1])
            .reduce((sum, current) => sum + current, 0);
    }

    getBondValue() {
        return [...this.positions.entries()].filter(a => a[0].bond).map(e => e[0].balance * e[1])
            .reduce((sum, current) => sum + current, 0);
    }
}

export class Loan extends Account {
    linkedAccount: Account;
    interestRate: number;
    minimumPayment: number;
    setPayment: number;
    fixed: boolean;

    constructor(name: string, balance: number, date: Date, linkedAccount: Account, interestRate: number, fixed: boolean) {
        super(name, balance, date, false);
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
    nextPage = (): void => {
    };
    previousPage = (): void => {
    };
}