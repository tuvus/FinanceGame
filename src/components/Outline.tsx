import {GameState} from "../Data.tsx";

type OutlineProps = {
    gameState: GameState;
    page: number;
    startYear: () => void;
}

export function Outline({gameState, page, startYear}: OutlineProps) {
    if (page >= gameState.pages.length - 1) return <></>;
    const currentPageName = gameState.getCurrentPage().name;
    return (<div
        className="flex flex-col items-center w-50 absolute left-1 top-1/2 -translate-y-1/2 align-middle bg-amber-100 rounded-2xl p-0">
        <h2 className="text-gray-700! pt-2">Finances</h2>
        <hr className="bg-black border w-full"/>
        {gameState.pages.filter(p => p.displayCondition())
            .map(p =>
                <div
                    className={"cursor-pointer p-1 w-full rounded-2xl transition-colors duration-300 hover:bg-gray-300! " + (currentPageName == p.name || p.name == "Start Year" ? "bg-gray-200" : "")}
                    key={p.name}
                    onClick={() => {
                        if (p.name == "Start Year") startYear();
                        else gameState.switchToPage(p.name)
                    }}>
                    <p className={"text-gray-700! " + (currentPageName == p.name ? "font-bold" : "")}>{p.name}</p>
                </div>)}
        <hr className="bg-black border w-full mt-2"/>
        <button className="m-2 w-40 text-2xl font-bold" onClick={() =>
            document.getElementById("goals-modal")!.style.display = "block"
        }>Goals
        </button>
        <button className="m-2 w-40 text-2xl font-bold" onClick={() =>
            document.getElementById("family-modal")!.style.display = "block"
        }>Family
        </button>
    </div>);
}