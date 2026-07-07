import {type GameStateProps} from "../Data.tsx";
import {useState} from "react";
import Select from "react-select";

class ItemType {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

interface ItemTypeSelectState {
    selectedType: ItemType | null;
}

class PayYear {
    year: number;

    constructor(year: number) {
        this.year = year;
    }
}

interface PayYearSelectState {
    selectedYear: PayYear | null;
}

export function BigTicketItemsPage({gameState}: GameStateProps) {
    // const [selectedBigTicketItem, setSelectedBigTicketItem] = useState(null);
    const [addBigTicketItem, setAddBigTicketItem] = useState(false);
    const [itemType, setItemType] = useState<ItemTypeSelectState>({selectedType: null});
    const [itemTypeOptions] = useState([new ItemType("Car"), new ItemType("House")]);
    const [carType, setCarType] = useState("");
    const [bigTicketBaseValue, setBigTicketBaseValue] = useState(0);
    const [payYearOptions] = useState([new PayYear(2), new PayYear(3), new PayYear(4), new PayYear(5), new PayYear(8), new PayYear(10), new PayYear(15), new PayYear(20), new PayYear(25), new PayYear(30), new PayYear(40)]);
    const [payYear, setPayYear] = useState<PayYearSelectState>({selectedYear: payYearOptions[3]});
    const [pLoans, setPLoans] = useState(0);

    return (<div>{gameState.character.bigTicketItems.bigTicketItems.map((bt, i) =>
            <div
                className="flex flex-col items-center w-124 bg-amber-100 rounded-xl p-4 m-4 gap-1 cursor-pointer"
                key={i}>
                <h3 className="text-gray-700 font-bold">{bt.name}</h3>
                <p className="text-gray-700">Total cost: {gameState.formatter.format(bt.targetBalance)}</p>
                <p className="text-gray-700">Allocated: {gameState.formatter.format(bt.balance)}</p>
                <p className="text-gray-700">Years to
                    purchase: {bt.buyDate.getFullYear() - gameState.date.getFullYear()}</p>
                <p className="text-gray-700">Monthly
                    allocation: {gameState.formatter.format((bt.targetBalance - bt.balance) / (bt.buyDate.getFullYear() - gameState.date.getFullYear()))}</p>

            </div>
        )}
            <button className="w-40 text-xl h-10 font-bold" onClick={() => setAddBigTicketItem(true)}>Add Item</button>
            {addBigTicketItem ?
                <div className="flex modal justify-center" onClick={() => setAddBigTicketItem(false)}>
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mb-auto mt-[20%] bg-amber-100 rounded-xl items-center p-4"
                        onClick={e => e.stopPropagation()}>
                        <h3 className="text-gray-700">Big Ticket Item</h3>

                        <Select className="w-60"
                                options={itemTypeOptions}
                                getOptionLabel={a => a.name}
                                value={itemType.selectedType}
                                isSearchable={false}
                                styles={{
                                    control: (baseStyles, state) => ({
                                        ...baseStyles, backgroundColor: "#e5e7eb", borderRadius: 10,
                                        border: state.isFocused ? "2px solid #fe9a00" : "2px solid #cccccc",
                                        "&:hover": {
                                            border: "2px solid #fe9a00",
                                        },
                                        "&:focus": {
                                            border: "2px solid #fe9a00",
                                            boxShadow: "none"
                                        },
                                        boxShadow: "none"
                                    }),
                                    placeholder: (baseStyles) => ({
                                        ...baseStyles, fontSize: 20
                                    }),
                                    singleValue: (baseStyles) => ({
                                        ...baseStyles, fontSize: 20
                                    }),
                                    option: (baseStyles, state) => ({
                                        ...baseStyles,
                                        color: "#364153",
                                        backgroundColor: state.isFocused ? "#e5e7eb" : undefined,
                                        borderRadius: 10
                                    })
                                }}
                                onChange={(t: ItemType | null) => setItemType({selectedType: t})}/>
                        {itemType.selectedType?.name == "Car" ? [
                            <div className="flex gap-4" key={0}>
                                <div
                                    className={"eventButton w-60! panelButton duration-300! " + (carType == "Buy used" ? "bg-gray-400!" : "bg-gray-200!")}
                                    onClick={() => {
                                        setCarType("Buy used");
                                        setBigTicketBaseValue(30000 * gameState.inflation);
                                    }}>
                                    <p className="text-gray-700">
                                        Buy a used car
                                    </p>
                                </div>
                                <div
                                    className={"eventButton w-60! panelButton duration-300! " + (carType == "Buy new" ? "bg-gray-400!" : "bg-gray-200!")}
                                    onClick={() => {
                                        setCarType("Buy new");
                                        setBigTicketBaseValue(48000 * gameState.inflation);
                                    }}>
                                    <p className="text-gray-700">
                                        Buy new car
                                    </p>
                                </div>
                            </div>,
                            [carType != "" ?
                                [<div className="flex gap-2" key={1}>
                                    <p className="text-gray-700 content-center">
                                        Years until the item is bought
                                    </p>
                                    <Select className="w-28"
                                            options={payYearOptions}
                                            getOptionLabel={a => a.year.toString()}
                                            value={payYear.selectedYear}
                                            isSearchable={false}
                                            styles={{
                                                control: (baseStyles, state) => ({
                                                    ...baseStyles,
                                                    backgroundColor: "#e5e7eb",
                                                    borderRadius: 10,
                                                    border: state.isFocused ? "2px solid #fe9a00" : "2px solid #cccccc",
                                                    "&:hover": {
                                                        border: "2px solid #fe9a00",
                                                    },
                                                    "&:focus": {
                                                        border: "2px solid #fe9a00",
                                                        boxShadow: "none"
                                                    },
                                                    boxShadow: "none"
                                                }),
                                                placeholder: (baseStyles) => ({
                                                    ...baseStyles, fontSize: 20
                                                }),
                                                singleValue: (baseStyles) => ({
                                                    ...baseStyles, fontSize: 20
                                                }),
                                                option: (baseStyles, state) => ({
                                                    ...baseStyles,
                                                    color: "#364153",
                                                    backgroundColor: state.isFocused ? "#e5e7eb" : undefined,
                                                    borderRadius: 10
                                                })
                                            }}
                                            onChange={(t: PayYear | null) => setPayYear({selectedYear: t})}/>
                                </div>,
                                    <p className="text-gray-700"
                                       key={2}>Cost: {gameState.formatter.format(bigTicketBaseValue)}</p>,
                                    <p className="text-gray-700" key={3}>Percent financed from loans at time of
                                        purchase: <input
                                            name="character.pretirement" className="w-16 bg-gray-200 rounded-lg p-1"
                                            min={0}
                                            max={80}
                                            value={pLoans}
                                            onChange={e => {
                                                setPLoans(e.target.valueAsNumber);
                                            }}
                                            type="number">
                                        </input> %</p>,

                                    <p className="text-gray-700" key={4}>Yearly
                                        payment: {gameState.formatter.format(bigTicketBaseValue * ((100 - pLoans) / 100) / (payYear.selectedYear?.year ?? 1))}</p>,
                                    <div className="flex gap-2 justify-center" key={5}>
                                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                                onClick={() => setAddBigTicketItem(false)}>Cancel
                                        </button>
                                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                                onClick={() => {
                                                    setAddBigTicketItem(false);
                                                    gameState.character.bigTicketItems.AddBigTicketItem(carType + " car", new Date(gameState.date.getFullYear() + (payYear.selectedYear?.year ?? 1), 0), bigTicketBaseValue * ((100 - pLoans) / 100));
                                                }}>Add
                                        </button>
                                    </div>,
                                ] : <div key={-1}></div>],
                        ] : <></>}
                    </div>
                </div>
                : <></>}
        </div>
    );
}