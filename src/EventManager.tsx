import type {ReactElement} from "react";
import {type GameState} from "./Data.tsx";
import random from "random";

export class LifeEvent {
    name: string;
    date: Date;
    element: ReactElement;
    customContinue: boolean;

    constructor(name: string, date: Date, element: ReactElement, customContinue: boolean = false) {
        this.name = name;
        this.date = date;
        this.element = element;
        this.customContinue = customContinue;
    }

    CopyWithDate(date: Date) {
        return new LifeEvent(this.name, date, this.element, this.customContinue);
    }
}

export class LifeEventManager {
    gameState: GameState;
    lifeEvents: LifeEvent[];
    nextYear: () => void;
    render: () => void;

    constructor(gameState: GameState, nextYear: () => void, render: () => void, startingEvents: LifeEvent[]) {
        this.gameState = gameState;
        this.nextYear = nextYear;
        this.render = render;
        this.lifeEvents = startingEvents;
    }

    AddEvent(lifeEvent: LifeEvent) {
        this.lifeEvents = [...this.lifeEvents, lifeEvent];
        this.lifeEvents.sort((a, b) => a.date.getTime() - b.date.getTime());
    }

    RemoveFirstEvent() {
        this.lifeEvents = this.lifeEvents.splice(1);
        this.render();
    }

    NextEvent() {
        this.lifeEvents = this.lifeEvents.splice(1);

        if (this.GetActiveEvent(this.gameState.date) == null) {
            this.nextYear();
            return;
        }

        this.gameState.date.setMonth(this.lifeEvents[0].date.getMonth());
        this.gameState.date.setDate(this.lifeEvents[0].date.getDate());
        this.render();
    }

    ReplaceEvent(lifeEvent: LifeEvent) {
        this.lifeEvents[0] = lifeEvent;
        this.gameState.date.setMonth(this.lifeEvents[0].date.getMonth());
        this.gameState.date.setDate(this.lifeEvents[0].date.getDate());
        this.render();
    }

    GetActiveEvent(date: Date): LifeEvent | null {
        if (this.lifeEvents.length > 0
            && this.lifeEvents[0].date.getFullYear() == date.getFullYear()
            && this.lifeEvents[0].date.getMonth() >= date.getMonth())
            return this.lifeEvents[0];
        if (this.lifeEvents.length > 0 && this.lifeEvents[0].date.getFullYear() < date.getFullYear()) {
            console.error("Found a life event that should have occurred before now! Event date: " + this.lifeEvents[0].date.toString() + " Current Date: " + date.toString());
            this.PrintEvents();
        }
        return null;
    }

    PrintEvents() {
        console.log(this.lifeEvents.map(le => le.name + " " + le.date.getFullYear()).join(", "));
    }
}

export class LifeEventSchedule {
    event: LifeEvent;
    maxOccurrences: number;
    minTimeBetweenOccurrence: number;
    lastOccurrence: number;
    probability: number;
    condition: (() => boolean) | null;

    constructor(event: LifeEvent, maxOccurrences: number, minTimeBetweenOccurrence: number, probability: number, condition: (() => boolean) | null) {
        this.event = event;
        this.maxOccurrences = maxOccurrences;
        this.minTimeBetweenOccurrence = minTimeBetweenOccurrence;
        this.probability = probability;
        this.condition = condition;
        this.lastOccurrence = -9999;
    }
}

export class LifeEventScheduler {
    lifeEventManager: LifeEventManager;
    gameState: GameState;
    eventSchedules: LifeEventSchedule[];

    constructor(lifeEventManager: LifeEventManager, gameState: GameState, eventSchedules: LifeEventSchedule[]) {
        this.lifeEventManager = lifeEventManager;
        this.gameState = gameState;
        this.eventSchedules = eventSchedules;
    }

    GenerateEvents() {
        const eventsToDo = this.eventSchedules
            .filter((e) => (!e.condition || e.condition())
                && e.maxOccurrences > 0
                && this.gameState.gameYear >= e.lastOccurrence + e.minTimeBetweenOccurrence)
            .map(e => ({e, p: random.float()}))
            .filter(e => e.p <= e.e.probability)
            .toSorted().slice(0, 5);
        eventsToDo.forEach(e => {
            this.lifeEventManager.AddEvent(e.e.event.CopyWithDate(new Date(this.gameState.date.getFullYear(), random.int(0, 11), random.int(1, 28))));
            e.e.lastOccurrence = this.gameState.gameYear;
            e.e.maxOccurrences--;
        })
    }
}