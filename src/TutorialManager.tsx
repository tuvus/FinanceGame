import type {ReactElement} from "react";

class ElementHighlighter {
    element: HTMLElement | null;
    previousZ: string | null;

    constructor() {
        this.element = null;
        this.previousZ = null;
    }

    setTargetElement(tElement: HTMLElement | null) {
        if (tElement == null || tElement?.id == "targetElementModal") {
            if (this.previousZ != null && this.element != null) {
                this.element.style["zIndex"] = this.previousZ.toString();
            }
            this.element = null;
            this.previousZ = null;
        } else if (tElement != this.element) {
            if (this.previousZ != null && this.element != null) {
                this.element.style["zIndex"] = this.previousZ.toString();
            }
            this.element = tElement;
            if (tElement.style.zIndex != null) {
                this.previousZ = tElement.style["zIndex"];
            } else {
                this.previousZ = null;
            }
            tElement.style["zIndex"] = "11";
        }
    }

    getTargetElementModal() {
        return (
            (this.element ?? null) !== null ?
                <div id="targetElementModal" className="flex modal z-10">

                </div> : <></>
        );
    }
}

export class TutorialEvent {
    name: string;
    eventCondition: () => boolean | null;
    panelElement: ReactElement;
    highlightElementId: string | null;
    satisfyCondition: () => boolean | null;
    buttonText: string | null;

    constructor(name: string, eventCondition: () => (boolean | null), panelElement: ReactElement, highlightElementId: string | null, satisfyCondition: () => (boolean | null), buttonText: string | null) {
        this.name = name;
        this.eventCondition = eventCondition;
        this.panelElement = panelElement;
        this.highlightElementId = highlightElementId;
        this.satisfyCondition = satisfyCondition;
        this.buttonText = buttonText;
    }
}

export class TutorialChain {
    name: string;
    tutorialCondition: () => boolean;
    events: TutorialEvent[];
    currentEvent: number;

    constructor(name: string, tutorialCondition: () => boolean, events: TutorialEvent[], currentEvent: number) {
        this.name = name;
        this.tutorialCondition = tutorialCondition;
        this.events = events;
        this.currentEvent = currentEvent;
    }

    getCurrentEvent() {
        return this.events[this.currentEvent];
    }
}

export class TutorialManager {
    highlighter: ElementHighlighter;
    tutorialChains: TutorialChain[];
    activeTutorial: TutorialChain | null;

    constructor() {
        this.highlighter = new ElementHighlighter();
        this.tutorialChains = [];
        this.activeTutorial = null;
    }

    checkActiveTutorial() {
        if (this.activeTutorial == null) {
            for (const tutorialChain of this.tutorialChains) {
                if (!tutorialChain.tutorialCondition())
                    continue;
                this.activeTutorial = tutorialChain;
                this.tutorialChains = this.tutorialChains.filter(c => c != this.activeTutorial);
                break;
            }
        }

        if (this.activeTutorial != null) {
            while (this.activeTutorial.currentEvent < this.activeTutorial.events.length) {
                const currentEvent = this.activeTutorial.getCurrentEvent();
                if (currentEvent.eventCondition() && !currentEvent.satisfyCondition()) {
                    break;
                } else {
                    this.activeTutorial.currentEvent++;
                }
            }
            if (this.activeTutorial.currentEvent == this.activeTutorial.events.length) {
                this.activeTutorial = null;
                this.checkActiveTutorial();
                return;
            } else if (this.activeTutorial.getCurrentEvent().highlightElementId != null) {
                this.highlighter.setTargetElement(document.getElementById(this.activeTutorial.getCurrentEvent().highlightElementId!));
            } else {
                this.highlighter.setTargetElement(null);
            }
        }
    }

    getTutorialElement() {
        this.checkActiveTutorial();
        if (this.activeTutorial) {
            const currentEvent = this.activeTutorial.events[this.activeTutorial.currentEvent];
            return (
                <>
                    <h2>{currentEvent.name}</h2>
                    <div className="flex flex-col items-center bg-amber-100 rounded-xl p-4 m-4 gap-1">
                        {currentEvent.panelElement}
                        {currentEvent.buttonText ? <div className="panelButton" onClick={() => this.activeTutorial!.currentEvent++}>{currentEvent.buttonText}</div> : <></>}
                    </div>
                    {this.highlighter.getTargetElementModal()}
                </>
            );
        }
    }
}