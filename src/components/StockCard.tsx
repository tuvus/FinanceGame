/* eslint-disable react-hooks/immutability */
import "../App.css";
import {StockAccount, StockBond} from "../Data.tsx";
import {LineChart} from "./LineChart.tsx";
import {useState} from "react";
import {NumberInputAutoSelect} from "../Utils.tsx";

type StockProps = {
    stock: StockBond,
    investmentAccount: StockAccount,
    formatter: Intl.NumberFormat,
    compactFormatter: Intl.NumberFormat,
    render: () => void,
}

function StockCard({stock, investmentAccount, formatter, compactFormatter, render}: StockProps) {
    const [dollarBuySell, setdollarBuySell] = useState(0);
    const [buySellState, setBuySellState] = useState<boolean | null>(null);
    const [minimized, setMinimized] = useState(true)

    return (<>
        <div className="flex flex-col items-center w-124 bg-amber-100 rounded-xl p-4 gap-1 cursor-pointer"
             onClick={() => setMinimized(!minimized)}>
            <h3 className="text-gray-700 font-bold">{stock.name}</h3>
            {stock.bond ?
                <>
                    <div className="flex items-baseline gap-2">
                        <p className="text-gray-700">5.2% Yearly Interest Rate</p>
                    </div>
                    {investmentAccount.positions.has(stock) ?
                        <p className="text-gray-700">
                            Value: {formatter.format(investmentAccount.getStock(stock).amount * stock.balance)}
                        </p> : <></>
                    }

                </> : <>
                    <div className="flex items-baseline gap-2">
                        <p className="text-gray-700">{formatter.format(stock.balance)}</p>
                        {stock.diff ? stock.diff >= 0 ? (<p className="text-green-700">+{stock.diff}%</p>)
                            : <p className="text-red-800">{stock.diff}%</p> : <></>}
                        <p className="text-gray-700">per share</p>
                    </div>
                    {investmentAccount.positions.has(stock) ?
                        <p className="text-gray-700">
                            Shares: {Math.round(investmentAccount.getStock(stock).amount * 100) / 100} ({formatter.format(investmentAccount.getStock(stock).amount * investmentAccount.getStock(stock).buyValue)})
                        </p> : <></>
                    }
                </>
            }
            {minimized ? <></> : <>
                {investmentAccount.positions.has(stock) ?
                    (investmentAccount.getStock(stock).buyValue <= stock.balance ?
                        <p className="text-gray-700">Total Gain/Loss <span
                            className="text-green-700">{formatter.format(investmentAccount.getStock(stock).amount * (stock.balance - investmentAccount.getStock(stock).buyValue))} (+{Math.round(stock.balance * 100 / investmentAccount.getStock(stock).buyValue) - 100}%)</span>
                        </p> :
                        <p className="text-gray-700">Total Gain/Loss <span
                            className="text-red-800">{formatter.format(investmentAccount.getStock(stock).amount * (stock.balance - investmentAccount.getStock(stock).buyValue))} ({Math.round(stock.balance * 100 / investmentAccount.getStock(stock).buyValue) - 100}%)</span>
                        </p>)
                    : <></>}
                <div className="flex gap-2">
                    <button className="w-40 text-xl h-10 font-bold" onClick={(e) => {
                        e.stopPropagation();
                        setdollarBuySell(Math.ceil(investmentAccount.balance * 100) / 100);
                        setBuySellState(true);
                    }}><h3>Buy</h3></button>
                    {investmentAccount.getStock(stock).amount > 0 ?
                        <button className="w-40 text-xl h-10 font-bold" onClick={(e) => {
                            e.stopPropagation();
                            setdollarBuySell(Math.floor(investmentAccount.getStock(stock).amount * stock.balance * 100) / 100);
                            setBuySellState(false);
                        }}><h3>Sell</h3></button> : <></>}
                </div>
                <LineChart className="h-60 w-120" data={stock.history}
                           index="dateString"
                           showLegend={false}
                           minValue={Math.min(...stock.history.map(h => h.balance))}
                           maxValue={Math.max(...stock.history.map(h => h.balance))}
                           aria-hidden="true"
                           categories={["balance"]}
                           valueFormatter={(number: number) => compactFormatter.format(number)}/>
            </>}
        </div>
        {buySellState == null ? <></> : (buySellState ?
                <div className="flex modal justify-center" onClick={() => setBuySellState(null)}>
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mb-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4"
                        onClick={e => e.stopPropagation()}>
                        <h3 className="text-gray-700">How many shares would you like to buy?</h3>
                        <p className="text-gray-700 text-lg!">Available: {formatter.format(investmentAccount.balance)}</p>
                        <div className="flex flex-col items-center">
                            <div className="w-fit bg-gray-200 rounded-xl p-1 ">
                                <p className="text-xl text-gray-700! pl-1">$
                                    <NumberInputAutoSelect
                                        className="w-40 text-gray-700"
                                        min={0}
                                        max={investmentAccount.balance}
                                        value={dollarBuySell}
                                        onChange={e =>
                                            setdollarBuySell(Math.min(Math.ceil(100 * investmentAccount.balance) / 100, e.target.valueAsNumber))}>
                                    </NumberInputAutoSelect>
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 text-lg!">Shares: {isNaN(dollarBuySell) ? 0 : Math.floor(100 * dollarBuySell / stock.balance) / 100}</p>

                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setBuySellState(null)
                                }}
                                className="p-2 w-25">Cancel
                            </button>
                            <button
                                disabled={isNaN(dollarBuySell) || dollarBuySell == 0}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (dollarBuySell.valueOf() <= 0 || isNaN(dollarBuySell)) return;
                                    investmentAccount.addStock(stock, Math.min(investmentAccount.balance, dollarBuySell) / stock.balance);
                                    investmentAccount.balance -= Math.min(investmentAccount.balance, dollarBuySell);
                                    render();
                                    setBuySellState(null);
                                }}
                                className="p-2 w-25 enabled:bg-green-700!">Buy
                            </button>
                        </div>
                    </div>
                </div> :
                <div className="flex modal justify-center">
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mb-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4">
                        <h3 className="text-gray-700">How many shares would you like to sell?</h3>
                        <p className="text-gray-700 text-lg!">Available: {formatter.format(investmentAccount.getStock(stock).amount * stock.balance)}</p>
                        <div className="flex flex-col items-center">
                            <div className="w-fit bg-gray-200 rounded-xl p-1 ">
                                <p className="text-xl text-gray-700! pl-1">$
                                    <NumberInputAutoSelect
                                        className="w-40 text-gray-700"
                                        min={0}
                                        max={investmentAccount.getStock(stock).amount * stock.balance}
                                        value={dollarBuySell}
                                        onChange={e =>
                                            setdollarBuySell(Math.min(Math.ceil(100 * investmentAccount.getStock(stock).amount * stock.balance) / 100, e.target.valueAsNumber))}>
                                    </NumberInputAutoSelect>
                                </p>
                            </div>
                        </div>
                        <p className="text-gray-700 text-lg!">Shares: {isNaN(dollarBuySell) ? 0 : Math.floor(100 * dollarBuySell / stock.balance) / 100}</p>

                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => setBuySellState(null)}
                                className="p-2 w-25">Cancel
                            </button>
                            <button
                                disabled={isNaN(dollarBuySell) || dollarBuySell == 0}
                                onClick={() => {
                                    if (dollarBuySell.valueOf() <= 0 || isNaN(dollarBuySell)) return;
                                    investmentAccount.balance += Math.min(dollarBuySell, investmentAccount.getStock(stock).amount * stock.balance);
                                    investmentAccount.removeStock(stock, dollarBuySell);
                                    render();
                                    setBuySellState(null);
                                }}
                                className="p-2 w-25 enabled:bg-green-700!">Sell
                            </button>
                        </div>
                    </div>
                </div>
        )}
    </>);
}

export default StockCard