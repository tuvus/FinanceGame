import type {ReactElement} from "react";

class ElementHighlighter {
    targetElement: HTMLElement | null;
    previousZ: string | null;

    constructor() {
        this.targetElement = null;
        this.previousZ = null;
    }

    setTargetElement(tElement: HTMLElement | null) {
        if (tElement == null || tElement?.id == "targetElementModal") {
            if (this.previousZ != null && this.targetElement != null) {
                this.targetElement.style["zIndex"] = this.previousZ.toString();
            }
            this.targetElement = null;
            this.previousZ = null;
        } else if (tElement != this.targetElement) {
            if (this.previousZ != null && this.targetElement != null) {
                this.targetElement.style["zIndex"] = this.previousZ.toString();
            }
            this.targetElement = tElement;
            if (tElement.style.zIndex != null) {
                this.previousZ = tElement.style["zIndex"];
            } else {
                this.previousZ = null;
            }
            tElement.style["zIndex"] = "11";
        }
    }
}

export class TutorialEvent {
    name: string;
    displayCondition: (() => boolean) | null;
    panelElement: ReactElement;
    highlightElementId: string | null;
    satisfyCondition: (() => boolean) | null;
    buttonText: string | null;

    constructor(name: string, eventCondition: (() => boolean) | null, panelElement: ReactElement, highlightElementId: string | null, satisfyCondition: (() => boolean) | null, buttonText: string | null) {
        this.name = name;
        this.displayCondition = eventCondition;
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

    constructor(name: string, tutorialCondition: () => boolean, events: TutorialEvent[]) {
        this.name = name;
        this.tutorialCondition = tutorialCondition;
        this.events = events;
        this.currentEvent = 0;
    }

    getCurrentEvent() {
        return this.events[this.currentEvent];
    }
}

export class TutorialManager {
    highlighter: ElementHighlighter;
    tutorialChains: TutorialChain[];
    activeTutorial: TutorialChain | null;
    render: () => void;

    constructor(tutorialChains: TutorialChain[], render: () => void) {
        this.highlighter = new ElementHighlighter();
        this.tutorialChains = tutorialChains;
        this.activeTutorial = null;
        this.render = render;
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
                if ((!currentEvent.displayCondition || currentEvent.displayCondition())
                    && (!currentEvent.satisfyCondition || !currentEvent.satisfyCondition())) {
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
                console.log(1)
                this.highlighter.setTargetElement(document.getElementById(this.activeTutorial.getCurrentEvent().highlightElementId!));
                console.log(this.highlighter.targetElement);
            } else {
                this.highlighter.setTargetElement(null);
            }
        }
    }

    getTutorialElement() {
        this.checkActiveTutorial();
        if (this.activeTutorial) {
            const currentEvent = this.activeTutorial.events[this.activeTutorial.currentEvent];
            let position = "top-0 left-0 w-full h-full ";
            let vPosition = "mt-[20%]";
            if (currentEvent.highlightElementId != null) {
                const bodyElement = document.body.getBoundingClientRect();
                const targetElement = document.getElementById(currentEvent.highlightElementId)!.getBoundingClientRect();
                if (targetElement.right <= bodyElement.width / 2) {
                    position = "top-0 left-[50%] w-1/2 h-full";
                } else if (targetElement.left >= bodyElement.width / 2) {
                    position = "top-0 left-0 w-1/2 h-full";
                } else if (targetElement.top >= bodyElement.height / 2) {
                    position = "top-[10%] left-0 w-full h-1/2";
                    vPosition = "";
                } else if (targetElement.bottom <= bodyElement.height / 2) {
                    position = "top-[60%] left-0 w-full h-1/2";
                    vPosition = "";
                }
            }
            return (
                <>
                    <div id="targetElementModal" className="flex modal z-10"></div>
                    <div className={"fixed z-12 pointer-events-none " + position}>
                        <div className={"flex flex-col ml-auto mr-auto mb-auto w-140 pointer-events-auto " + vPosition}>
                            <div className="flex flex-col items-center bg-amber-100 rounded-xl p-4 m-4 gap-1">
                                <h2 className="text-gray-700! font-bold!">{currentEvent.name}</h2>
                                {currentEvent.panelElement}
                                {currentEvent.buttonText ?
                                    <button className="ml-5 text-xl font-bold w-50 h-10"
                                            onClick={() => {
                                                this.activeTutorial!.currentEvent++;
                                                this.render();
                                            }}>
                                        {currentEvent.buttonText}
                                    </button> : <></>}
                            </div>
                        </div>
                    </div>
                </>
            );
        }
    }
}