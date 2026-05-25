/* eslint-disable react-hooks/immutability */
import "../App.css";
import {StockAccount, StockBond} from "../Data.tsx";
import {LineChart} from "./LineChart.tsx";
import {useState} from "react";

type StockProps = {
    stock: { a: StockBond },
    investmentAccount: { a: StockAccount },
    formatter: Intl.NumberFormat,
    compactFormatter: Intl.NumberFormat,
    render: () => void,
}

function StockCard({stock, investmentAccount, formatter, compactFormatter, render}: StockProps) {
    const [stocksToBuySell, setStocksToBuySell] = useState(0);
    const [buySellState, setBuySellState] = useState<boolean | null>(null);
    const [minimized, setMinimized] = useState(true)

    return (<>
        <div className="flex flex-col items-center bg-amber-100 rounded-xl p-4 m-4 gap-1 cursor-pointer"
             onClick={() => setMinimized(!minimized)}>
            <h3 className="text-gray-700 font-bold">{stock.a.name}</h3>
            {stock.a.bond ?
                <>
                    <div className="flex items-baseline gap-2">
                        <p className="text-gray-700">2.2% Yearly Interest Rate</p>
                    </div>
                    <p className="text-gray-700">
                        Value: {formatter.format(investmentAccount.a.getStock(stock.a) * stock.a.balance)}
                    </p>
                </>
                :
                <>
                    <div className="flex items-baseline gap-2">
                        <p className="text-gray-700">{formatter.format(stock.a.balance)}</p>
                        {stock.a.diff ? stock.a.diff >= 0 ? (<p className="text-green-700">+{stock.a.diff}%</p>)
                            : <p className="text-red-800">{stock.a.diff}%</p> : <></>}
                        <p className="text-gray-700">per share</p>
                    </div>
                    <p className="text-gray-700">
                        Shares: {Math.round(investmentAccount.a.getStock(stock.a) * 100) / 100} ({formatter.format(investmentAccount.a.getStock(stock.a) * stock.a.balance)})
                    </p>
                </>
            }
            {minimized ? <></> : <>
                <div className="flex gap-2">
                    <button className="w-40 text-xl h-10 font-bold" onClick={(e) => {
                        e.stopPropagation()
                        setStocksToBuySell(Math.floor(investmentAccount.a.balance * 100 / stock.a.balance) / 100);
                        setBuySellState(true);
                    }}><h3>Buy</h3></button>
                    {investmentAccount.a.getStock(stock.a) > 0 ?
                        <button className="w-40 text-xl h-10 font-bold" onClick={(e) => {
                            e.stopPropagation()
                            setStocksToBuySell(Math.floor(investmentAccount.a.getStock(stock.a) * 100) / 100);
                            setBuySellState(false);
                        }}><h3>Sell</h3></button> : <></>}
                </div>
                <LineChart className="h-60 w-120" data={stock.a.history}
                           index="date"
                           showLegend={false}
                           minValue={Math.min(...stock.a.history.map(h => h.balance))}
                           maxValue={Math.max(...stock.a.history.map(h => h.balance))}
                           aria-hidden="true"
                           categories={["balance"]}
                           valueFormatter={(number: number) => compactFormatter.format(number)}/>
            </>}
        </div>
        {buySellState == null ? <></> : (buySellState ?
                <div className="flex modal justify-center">
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mb-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4">
                        <h3 className="text-gray-700">How many Shares would you like to buy?</h3>
                        <div className="flex">
                            <p className="text-xl text-gray-700! p-2">$</p>
                            <input name="buy-shares" className="w-80 bg-white rounded-xl p-1 text-gray-700"
                                   min={0}
                                   max={investmentAccount.a.balance / stock.a.balance}
                                   value={stocksToBuySell}
                                   onChange={(e) =>
                                       setStocksToBuySell(Math.min(investmentAccount.a.balance / stock.a.balance, e.target.valueAsNumber))}
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
                                onClick={(e) => {
                                    e.stopPropagation()
                                    if (stocksToBuySell.valueOf() <= 0 || isNaN(stocksToBuySell)) return;
                                    investmentAccount.a.addStock(stock.a, stocksToBuySell);
                                    investmentAccount.a.balance -= stocksToBuySell * stock.a.balance;
                                    render();
                                    setBuySellState(null);
                                }}
                                className="p-2 w-25 bg-green-700!">Buy
                            </button>
                        </div>
                    </div>
                </div> :
                <div className="flex modal justify-center">
                    <div
                        className="flex flex-col gap-2 ml-auto mr-auto mb-auto mt-[20%] w-100 bg-amber-100 rounded-xl justify-center p-4">
                        <h3 className="text-gray-700">How many Shares would you like to sell?</h3>
                        <div className="flex">
                            <p className="text-xl text-gray-700! p-2">$</p>
                            <input name="sell-shares" className="w-80 bg-white rounded-xl p-1 text-gray-700"
                                   min={0}
                                   max={investmentAccount.a.getStock(stock.a)}
                                   value={stocksToBuySell}
                                   onChange={(e) => setStocksToBuySell(Math.min(investmentAccount.a.getStock(stock.a), e.target.valueAsNumber))}
                                   type="number">
                            </input>
                        </div>

                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={() => setBuySellState(null)}
                                className="p-2 w-25">Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (stocksToBuySell.valueOf() <= 0 || isNaN(stocksToBuySell)) return;
                                    investmentAccount.a.removeStock(stock.a, stocksToBuySell);
                                    investmentAccount.a.balance += stocksToBuySell * stock.a.balance;
                                    render();
                                    setBuySellState(null);
                                }}
                                className="p-2 w-25 bg-green-700!">Sell
                            </button>
                        </div>
                    </div>
                </div>
        )}
    </>);
}

export default StockCard