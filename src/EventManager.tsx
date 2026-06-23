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
    nextYear: () => void;
    render: () => void;

    constructor(date: Date, nextYear: () => void, render: () => void, startingEvents: LifeEvent[]) {
        this.date = date;
        this.nextYear = nextYear;
        this.render = render;
        this.lifeEvents = startingEvents;
    }

    AddEvent(lifeEvent: LifeEvent) {
        lifeEvent.lifeEventManager = this;
        this.lifeEvents = [...this.lifeEvents, lifeEvent];
        this.lifeEvents.sort((a, b) => b.date.getTime() - a.date.getTime());
    }

    RemoveFirstEvent() {
        this.lifeEvents = this.lifeEvents.splice(1);
        this.render();
    }

    NextEvent() {
        const date = this.lifeEvents[0].date;
        this.lifeEvents = this.lifeEvents.splice(1);

        if (this.GetActiveEvent(date) == null) {
            this.nextYear();
            return;
        }

        this.date.setDate(this.lifeEvents[0].date.getDate());
        this.render();
    }

    ReplaceEvent(lifeEvent: LifeEvent) {
        this.lifeEvents[0] = lifeEvent;
        this.date.setDate(this.lifeEvents[0].date.getDate());
        this.render();
    }

    GetActiveEvent(date: Date): LifeEvent | null {
        if (this.lifeEvents.length > 0
            && this.lifeEvents[0].date.getFullYear() == date.getFullYear()
            && this.lifeEvents[0].date.getMonth() >= date.getMonth())
            return this.lifeEvents[0];
        return null;
    }

    PrintEvents() {
        console.log(this.lifeEvents.map(le => le.name).join(", "));
    }
}