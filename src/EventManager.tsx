import type {ReactElement} from "react";


export class LifeEvent {
    name: string;
    year: number;
    month: number;
    element: ReactElement;
    customContinue: boolean;
    lifeEventManager: LifeEventManager | null = null;

    constructor(name: string, year: number, month: number, element: ReactElement, customContinue: boolean = false) {
        this.name = name;
        this.year = year;
        this.month = month;
        this.element = element;
        this.customContinue = customContinue;
    }
}

export class LifeEventManager {
    lifeEvents: LifeEvent[];
    endYear: () => void;
    setMonth: (month: number) => void;
    render: () => void;

    constructor(endYear: () => void, setMonth: (month: number) => void, render: () => void) {
        this.lifeEvents = [];
        this.endYear = endYear;
        this.setMonth = setMonth;
        this.render = render;
    }

    AddEvent(lifeEvent: LifeEvent) {
        lifeEvent.lifeEventManager = this;
        this.lifeEvents = [...this.lifeEvents, lifeEvent];
        this.lifeEvents.sort((a, b) => b.year + b.month / 12 - a.year - a.month / 12);
    }

    NextEvent() {
        const year = this.lifeEvents[0].year;
        const month = this.lifeEvents[0].month;
        this.lifeEvents.pop();
        if (this.GetActiveEvent(year, month) == null) {
            this.endYear();
            return;
        }

        this.setMonth(this.lifeEvents[0].month);
        this.render();
    }

    GetActiveEvent(year: number, month: number): LifeEvent | null {
        if (this.lifeEvents.length > 0
            && this.lifeEvents[0].year == year
            && this.lifeEvents[0].month == month)
            return this.lifeEvents[0];
        return null;
    }
}