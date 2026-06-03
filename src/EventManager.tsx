import type {ReactElement} from "react";


export class LifeEvent {
    name: string;
    date: Date;
    element: ReactElement;
    customContinue: boolean;
    lifeEventManager: LifeEventManager | null = null;

    constructor(name: string, date: Date, element: ReactElement, customContinue: boolean = false) {
        this.name = name;
        this.date = date;
        this.element = element;
        this.customContinue = customContinue;
    }
}

export class LifeEventManager {
    lifeEvents: LifeEvent[];
    date: Date;
    endYear: () => void;
    render: () => void;

    constructor(date: Date, endYear: () => void, render: () => void) {
        this.lifeEvents = [];
        this.date = date;
        this.endYear = endYear;
        this.render = render;
    }

    AddEvent(lifeEvent: LifeEvent) {
        lifeEvent.lifeEventManager = this;
        this.lifeEvents = [...this.lifeEvents, lifeEvent];
        this.lifeEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    NextEvent() {
        const date = this.lifeEvents[0].date;
        this.lifeEvents.pop();
        if (this.GetActiveEvent(date) == null) {
            this.endYear();
            return;
        }

        console.log("set date" + this.lifeEvents[0].date.toDateString())
        this.date.setDate(this.lifeEvents[0].date.getDate());
    }

    GetActiveEvent(date: Date): LifeEvent | null {
        if (this.lifeEvents.length > 0
            && this.lifeEvents[0].date.getFullYear() == date.getFullYear()
            && this.lifeEvents[0].date.getUTCMonth() >= date.getMonth())
            return this.lifeEvents[0];
        return null;
    }
}