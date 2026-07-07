import {type GameStateProps} from "../Data.tsx";
import {useState} from "react";
import Select from "react-select";

export function BigTicketItemsPage({gameState}: GameStateProps) {

    const [selectedBigTicketItem, setSelectedBigTicketItem] = useState(null);
    const [addBigTicketItem, setAddBigTicketItem] = useState(false);
    const [itemType, setItemType] = useState("")

    return (<div>{gameState.character.bigTicketItems.bigTicketItems.map((bt, i) =>
            <div
                className="flex flex-col items-center w-124 bg-amber-100 rounded-xl p-4 m-4 gap-1 cursor-pointer"
                key={i}>
                <h3 className="text-gray-700 font-bold">{bt.name}</h3>
            </div>
        )}
            <button className="w-40 text-xl h-10 font-bold" onClick={() => setAddBigTicketItem(true)}>Add Item</button>
            {addBigTicketItem ?
                <div className="flex modal justify-center" onClick={() => setAddBigTicketItem(false)}>
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mb-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4"
                        onClick={e => e.stopPropagation()}>
                        <h3 className="text-gray-700">Big Ticket Item</h3>

                        <Select
                            options={["Car", "House"]}
                            value={itemType}
                            getOptionLabel={i => i}
                            getOptionValue={i => i}
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
                            onChange={(t: string | null) => setItemType(t ?? "")}></Select>
                    </div>
                </div>
                : <></>}
        </div>
    );
}