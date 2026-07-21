import {type LifeEventManager, LifeEventScheduler} from "./EventManager.tsx";
import type {JSX} from "react";
import type {Character} from "./Character.tsx";

export type GameStateProps = {
    gameState: GameState;
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
    pages: {
        name: string
        page: JSX.Element
        displayCondition: () => boolean
    }[] = [];
    date: Date;
    // The number of years the player has played, 0 is when choosing college, 1 is the first year they allocate for and so on
    gameYear: number = 0;
    inflation: number = 1;
    character: Character;
    formatter: Intl.NumberFormat;
    compactFormatter: Intl.NumberFormat;
    lifeEventManager: LifeEventManager | null;
    lifeEventScheduler: LifeEventScheduler | null;
    bigTicketItemsUnlocked: boolean = false;
    investmentsUnlocked: boolean = false;
    retirementUnlocked: boolean = false;
    tutorial: boolean;

    constructor(date: Date, character: Character, formatter: Intl.NumberFormat, compactFormatter: Intl.NumberFormat, tutorial: boolean) {
        this.date = date;
        this.character = character;
        this.formatter = formatter;
        this.compactFormatter = compactFormatter;
        this.tutorial = tutorial;
        this.lifeEventManager = null;
        this.lifeEventScheduler = null
    }

    GetCurrentPage() {
        return this.pages[Math.min(this.page, this.pages.length - 1)];
    }

    nextPage = (): void => {
    };
    previousPage = (): void => {
    };
    /* eslint-disable @typescript-eslint/no-unused-vars */
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    switchToPage = (name: string): void => {
    };
    /* eslint-enable @typescript-eslint/no-unused-vars */
    render = (): void => {
    };
}