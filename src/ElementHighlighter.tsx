export class ElementHighlighter {
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