/* eslint-disable react-hooks/immutability */
import {Account, type GameStateProps} from "../Data.tsx";
import {useState} from "react";
import Select from "react-select";
import {GetReactSelectStyle, ReplaceYear} from "../Utils.tsx";
import random from "random";
import type {BigTicketItem} from "../Character.tsx";

class ItemType {
    name: string;

    constructor(name: string) {
        this.name = name;
    }
}

interface ItemTypeSelectState {
    selectedType: ItemType | null;
}

interface TransferFundsSelectState {
    selectedAccount: Account | null;
}

export function BigTicketItemsPage({gameState}: GameStateProps) {
    const [selectedBigTicketItem, setSelectedBigTicketItem] = useState<BigTicketItem | null>(null);
    const [addBigTicketItem, setAddBigTicketItem] = useState(false);
    const [itemType, setItemType] = useState<ItemTypeSelectState>({selectedType: null});
    const [itemTypeOptions] = useState([new ItemType("Car"), new ItemType("House")]);
    const [itemSubType, setItemSubType] = useState("");
    const [purchaseDesc, setPurchaseDesc] = useState("");
    const [bigTicketBaseValue, setBigTicketBaseValue] = useState(0);
    const [pLoans, setPLoans] = useState(0);
    const [duration, setDuration] = useState<number>(gameState.character.car.getAvgExpirationDate().getFullYear() - gameState.date.getFullYear());
    const [transferMoney, setTransferMoney] = useState(false);
    const [transferFrom, setTransferFrom] = useState<TransferFundsSelectState>({selectedAccount: null});
    const [fundsToTransfer, setFundsToTransfer] = useState(0);

    return (<div>
            <button className="w-40 text-xl h-10 font-bold" onClick={() => setAddBigTicketItem(true)}>Add Item</button>
            {gameState.character.bigTicketItems.bigTicketItems.map((bt, i) =>
                <div
                    className="flex flex-col items-center w-124 bg-amber-100 rounded-xl p-4 m-4 gap-1 cursor-pointer"
                    key={i} onClick={() => {
                    setSelectedBigTicketItem(bt);
                    setTransferMoney(false);
                    setDuration(bt.buyDate.getFullYear() - gameState.date.getFullYear());
                }}>
                    <h3 className="text-gray-700 font-bold">{bt.name}</h3>
                    <p className="text-gray-700">Total cost: {gameState.formatter.format(bt.targetBalance)}</p>
                    <p className="text-gray-700">Allocated: {gameState.formatter.format(bt.balance)}</p>
                    {bt.buyDate.getFullYear() > gameState.date.getFullYear() ? [
                        <p className="text-gray-700" key={1}>Years to
                            purchase: {bt.buyDate.getFullYear() - gameState.date.getFullYear()}</p>,
                        <p className="text-gray-700" key={2}>Yearly
                            allocation: {gameState.formatter.format((bt.targetBalance - bt.balance) / (bt.buyDate.getFullYear() - gameState.date.getFullYear()))}</p>,
                    ] : [
                        <p className="text-gray-700" key={1}>
                            Buying this year
                        </p>,
                        <p className="text-gray-700" key={2}>
                            Out of pocket payment: {gameState.formatter.format(bt.targetBalance - bt.balance)}
                        </p>
                    ]}

                </div>
            )}
            {addBigTicketItem ?
                <div className="flex modal justify-center" onClick={() => setAddBigTicketItem(false)}>
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mb-auto mt-[10%] bg-amber-100 rounded-xl items-center p-4"
                        onClick={e => e.stopPropagation()}>
                        <h3 className="text-gray-700">Big Ticket Item</h3>

                        <Select className="w-60"
                                options={itemTypeOptions}
                                getOptionLabel={a => a.name}
                                value={itemType.selectedType}
                                isSearchable={false}
                                styles={GetReactSelectStyle<ItemType>()}
                                onChange={(t: ItemType | null) => setItemType({selectedType: t})}/>
                        {itemType.selectedType?.name == "Car" ?
                            <div className="flex gap-4" key={0}>
                                <div
                                    className={"eventButton w-60! panelButton duration-300! " + (itemSubType == "Buy used" ? "bg-gray-400!" : "bg-gray-200!")}
                                    onClick={() => {
                                        setItemSubType("Buy used");
                                        setBigTicketBaseValue(30000 * gameState.inflation);
                                        setPurchaseDesc("Time to buy a car!");
                                    }}>
                                    <p className="text-gray-700">
                                        Buy a used car
                                    </p>
                                </div>
                                <div
                                    className={"eventButton w-60! panelButton duration-300! " + (itemSubType == "Buy new" ? "bg-gray-400!" : "bg-gray-200!")}
                                    onClick={() => {
                                        setItemSubType("Buy new");
                                        setBigTicketBaseValue(48000 * gameState.inflation);
                                        setPurchaseDesc("Time to buy a car!");
                                    }}>
                                    <p className="text-gray-700">
                                        Buy new car
                                    </p>
                                </div>
                            </div>
                            : <></>}
                        {itemType.selectedType?.name == "House" ?
                            <div className="flex gap-4" key={0}>
                                <div
                                    className={"eventButton w-60! panelButton duration-300! " + (itemSubType == "Buy " ? "bg-gray-400!" : "bg-gray-200!")}
                                    onClick={() => {
                                        setItemSubType("Buy ");
                                        setBigTicketBaseValue(400000 * gameState.inflation);
                                        setPurchaseDesc("You bought a house!");
                                    }}>
                                    <p className="text-gray-700">
                                        Buy a house
                                    </p>
                                </div>
                                <div
                                    className={"eventButton w-60! panelButton duration-300! " + (itemSubType == "Build new" ? "bg-gray-400!" : "bg-gray-200!")}
                                    onClick={() => {
                                        setItemSubType("Build new");
                                        setBigTicketBaseValue(420000 * gameState.inflation);
                                        setPurchaseDesc("You built a new house!");
                                    }}>
                                    <p className="text-gray-700">
                                        Build a house
                                    </p>
                                </div>
                            </div>
                            : <></>}
                        {itemSubType != "" ? [
                            <div className="flex gap-2" key={1}>
                                <p className="text-gray-700" key={3}>
                                    Years until the item is bought <input
                                    className="w-16 bg-gray-200 rounded-lg p-1"
                                    min={0}
                                    max={80}
                                    value={duration}
                                    onChange={e => {
                                        if (!isNaN(e.target.valueAsNumber) && e.target.valueAsNumber >= 0) {
                                            setDuration(e.target.valueAsNumber);
                                        }
                                    }}
                                    type="number">
                                </input></p>
                            </div>,
                            <p className="text-gray-700"
                               key={2}>Cost: {gameState.formatter.format(bigTicketBaseValue)}</p>,
                            <p className="text-gray-700" key={3}>Percent financed from loans at time of
                                purchase: <input
                                    className="w-16 bg-gray-200 rounded-lg p-1"
                                    min={0}
                                    max={80}
                                    value={pLoans}
                                    onChange={e => {
                                        setPLoans(e.target.valueAsNumber);
                                    }}
                                    type="number">
                                </input> %</p>,

                            (duration > 0 ? [
                                    <p className="text-gray-700" key={4}>Yearly
                                        payment: {gameState.formatter.format(bigTicketBaseValue * ((100 - pLoans) / 100) / duration)}</p>,
                                ] : <p className="text-gray-700" key={4}>
                                    {gameState.formatter.format(bigTicketBaseValue * ((100 - pLoans) / 100))} out of
                                    pocket payment
                                </p>
                            ),
                            <div className="flex gap-2 justify-center" key={5}>
                                <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                        onClick={() => setAddBigTicketItem(false)}>Cancel
                                </button>
                                <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                        onClick={() => {
                                            setAddBigTicketItem(false);
                                            const targetBalance = duration > 0 ? bigTicketBaseValue * ((100 - pLoans) / 100) : 0;
                                            gameState.character.bigTicketItems.AddBigTicketItem(
                                                itemSubType + " " + itemType.selectedType!.name.toLowerCase(),
                                                purchaseDesc,
                                                new Date(gameState.date.getFullYear() + duration,
                                                    random.int(0, 11),
                                                    random.int(0, 28),
                                                    random.int(9, 18)),
                                                bigTicketBaseValue,
                                                targetBalance);
                                        }}>Add
                                </button>
                            </div>
                        ] : <div key={-1}></div>}
                    </div>
                </div>
                : <></>}

            {selectedBigTicketItem ?
                <div className="flex modal justify-center" onClick={() => setSelectedBigTicketItem(null)}>
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mb-auto mt-[15%] bg-amber-100 rounded-xl items-center p-4"
                        onClick={e => e.stopPropagation()}>
                        <h3 className="text-gray-700">Big Ticket Item</h3>
                        <p className="text-gray-700">Cost: {gameState.formatter.format(selectedBigTicketItem.fullCost)}</p>
                        <p className="text-gray-700">Allocated: {gameState.formatter.format(selectedBigTicketItem.balance)}</p>
                        <div className="flex gap-2">
                            <p className="text-gray-700 content-center">
                                Years until the item is bought <input
                                className="w-14 bg-gray-200 rounded-lg p-1"
                                min={0}
                                max={80}
                                value={duration}
                                onChange={e => {
                                    if (!isNaN(e.target.valueAsNumber) && e.target.valueAsNumber >= 0) {
                                        setDuration(e.target.valueAsNumber);
                                        selectedBigTicketItem.buyDate = ReplaceYear(selectedBigTicketItem.buyDate, gameState.date.getFullYear() + e.target.valueAsNumber);
                                    }
                                }}
                                type="number">
                            </input>
                            </p>
                        </div>
                        <p className="text-gray-700">
                            Percent financed from loans at time of purchase: <input
                            className="w-16 bg-gray-200 rounded-lg p-1"
                            min={0}
                            max={80}
                            value={pLoans}
                            onChange={e => {
                                setPLoans(e.target.valueAsNumber);
                            }}
                            type="number">
                        </input> %</p>


                        {(duration > 0 ? [
                                <p className="text-gray-700" key={4}>Yearly
                                    payment: {gameState.formatter.format((selectedBigTicketItem.targetBalance * ((100 - pLoans) / 100) - selectedBigTicketItem.balance) / duration)}</p>,
                            ] : <p className="text-gray-700"
                                   key={4}>
                                {gameState.formatter.format(selectedBigTicketItem.fullCost * ((100 - pLoans) / 100) - selectedBigTicketItem.balance)} out
                                of pocket payment
                            </p>
                        )}
                        <button className="w-50 text-xl h-10 p-1 font-bold mt-2 bg-red-700!"
                                onClick={() => {
                                    gameState.character.bigTicketItems.RemoveBigTicketItem(selectedBigTicketItem);
                                    setSelectedBigTicketItem(null);
                                    gameState.render();
                                }}>Remove
                        </button>
                        <div className="flex gap-2 justify-center">
                            <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                    onClick={() => setSelectedBigTicketItem(null)}>Close
                            </button>
                            <button className="w-50 text-xl h-10 p-1 font-bold mt-2"
                                    onClick={() => setTransferMoney(true)}>Allocate Money
                            </button>
                        </div>
                    </div>
                </div>
                : <></>}
            {selectedBigTicketItem && transferMoney ?
                <div className="modal justify-center"
                     onClick={() => setTransferMoney(false)}>
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4"
                        onClick={e => e.stopPropagation()}>
                        <h3 className="text-gray-700">Transfer Funds</h3>
                        <p className="text-gray-700 text-lg!">Allocated: {gameState.formatter.format(selectedBigTicketItem.balance)}
                        </p>
                        <p className="text-gray-700 text-lg!">To
                            Allocate: {gameState.formatter.format(selectedBigTicketItem.targetBalance - selectedBigTicketItem.balance)}
                        </p>
                        <Select
                            options={gameState.character.accounts.filter(a => a.isOwnedAccount)}
                            getOptionLabel={a => a.name}
                            value={transferFrom.selectedAccount}
                            isSearchable={false}
                            styles={GetReactSelectStyle<Account>()}
                            onChange={(a: Account | null) => {
                                setTransferFrom({selectedAccount: a});
                            }}></Select>
                        {transferFrom.selectedAccount ?
                            <p className="text-gray-700 text-lg!">Balance: {gameState.formatter.format(transferFrom.selectedAccount!.balance)}
                            </p> : <></>
                        }
                        <div className="flex">
                            <p className="text-xl text-gray-700! p-2">$</p>
                            <input name="transfer-funds" className="w-80 bg-gray-200 rounded-xl p-1 text-gray-700"
                                   min={-selectedBigTicketItem.balance}
                                   max={Math.min(transferFrom.selectedAccount?.balance ?? 0, selectedBigTicketItem.targetBalance - selectedBigTicketItem.balance)}
                                   disabled={transferFrom.selectedAccount == null}
                                   value={fundsToTransfer}
                                   onChange={e => setFundsToTransfer(Math.min(Math.min(transferFrom.selectedAccount?.balance ?? 0, e.target.valueAsNumber), selectedBigTicketItem.targetBalance - selectedBigTicketItem.balance))}
                                   type="number">
                            </input>
                        </div>

                        <div className="flex gap-2 justify-center">
                            <button
                                id="transfer-cancel"
                                onClick={() => setTransferMoney(false)}
                                className="p-2 w-25">Cancel
                            </button>
                            <button
                                id="transfer-confirm"
                                disabled={transferFrom.selectedAccount == null || isNaN(fundsToTransfer) || fundsToTransfer > (Math.min(transferFrom?.selectedAccount.balance ?? 0, selectedBigTicketItem.targetBalance - selectedBigTicketItem.balance)) || -fundsToTransfer > selectedBigTicketItem.balance}
                                onClick={() => {
                                    if (transferFrom.selectedAccount != null) {
                                        const toTransfer = Math.max(Math.min(Math.min(fundsToTransfer, transferFrom.selectedAccount.balance), selectedBigTicketItem.targetBalance - selectedBigTicketItem.balance), -selectedBigTicketItem.balance);
                                        transferFrom.selectedAccount.balance -= toTransfer;
                                        selectedBigTicketItem!.balance += toTransfer;
                                        gameState.render();
                                    }
                                    setTransferMoney(false);
                                }}
                                className="p-2 w-25 enabled:bg-green-700! disabled:bg-gray-400!">Transfer
                            </button>
                        </div>
                    </div>
                </div>
                : <></>
            }
        </div>
    );
}