/* eslint-disable react-hooks/immutability */
import "../App.css";
import {StockAccount, StockBond} from "../Data.tsx";
import {LineChart} from "./LineChart.tsx";
import {useState} from "react";

type StockProps = {
    stock: StockBond,
    investmentAccount: StockAccount,
    formatter: Intl.NumberFormat,
    compactFormatter: Intl.NumberFormat,
    render: () => void,
}

function StockCard({stock, investmentAccount, formatter, compactFormatter, render}: StockProps) {
    const [stocksToBuySell, setStocksToBuySell] = useState(0);
    const [buySellState, setBuySellState] = useState<boolean | null>(null);
    const [minimized, setMinimized] = useState(true)

    return (<>
        <div className="flex flex-col items-center w-124 bg-amber-100 rounded-xl p-4 m-4 gap-1 cursor-pointer"
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
                        e.stopPropagation()
                        setStocksToBuySell(Math.floor(investmentAccount.balance * 100 / stock.balance) / 100);
                        setBuySellState(true);
                    }}><h3>Buy</h3></button>
                    {investmentAccount.getStock(stock).amount > 0 ?
                        <button className="w-40 text-xl h-10 font-bold" onClick={(e) => {
                            e.stopPropagation()
                            setStocksToBuySell(Math.floor(investmentAccount.getStock(stock).amount * 100) / 100);
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
                        <div className="flex">
                            <p className="text-xl text-gray-700! p-2">$</p>
                            <input name="buy-shares" className="w-80 bg-gray-200 rounded-xl p-1 text-gray-700"
                                   min={0}
                                   max={investmentAccount.balance / stock.balance}
                                   value={stocksToBuySell}
                                   onChange={(e) =>
                                       setStocksToBuySell(Math.min(investmentAccount.balance / stock.balance, e.target.valueAsNumber))}
                                   type="number">
                            </input>
                        </div>

                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setBuySellState(null)
                                }}
                                className="p-2 w-25">Cancel
                            </button>
                            <button
                                disabled={stocksToBuySell == 0}
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (stocksToBuySell.valueOf() <= 0 || isNaN(stocksToBuySell)) return;
                                    investmentAccount.addStock(stock, stocksToBuySell);
                                    investmentAccount.balance -= stocksToBuySell * stock.balance;
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
                        <div className="flex">
                            <p className="text-xl text-gray-700! p-2">$</p>
                            <input name="sell-shares" className="w-80 bg-gray-200 rounded-xl p-1 text-gray-700"
                                   min={0}
                                   max={investmentAccount.getStock(stock).amount}
                                   value={stocksToBuySell}
                                   onChange={(e) => setStocksToBuySell(Math.min(investmentAccount.getStock(stock).amount, e.target.valueAsNumber))}
                                   type="number">
                            </input>
                        </div>

                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => setBuySellState(null)}
                                className="p-2 w-25">Cancel
                            </button>
                            <button
                                disabled={stocksToBuySell == 0}
                                onClick={() => {
                                    if (stocksToBuySell.valueOf() <= 0 || isNaN(stocksToBuySell)) return;
                                    investmentAccount.removeStock(stock, stocksToBuySell);
                                    investmentAccount.balance += stocksToBuySell * stock.balance;
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