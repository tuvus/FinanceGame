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
        this.history = [...this.history, {date: date, dateString: this.getDateString(date), balance: this.getTotalValue()}];
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