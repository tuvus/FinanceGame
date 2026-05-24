export class Account {
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


export class Stock extends Account {
    shares: number;

    constructor(name: string, balance: number, date: number) {
        super(name, balance, date, false);
        this.shares = 0;
    }

    getValue(): number {
        return this.shares * this.balance;
    }
}
