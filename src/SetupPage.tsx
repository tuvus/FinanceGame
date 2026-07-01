import './App.css'
import {useState} from "react";

type SetupProps = {
    fname: string; lname: string; startGame: (fname: string, lname: string, tutorial: boolean) => void;
}

function SetupPage({fname, lname, startGame}: SetupProps) {
    const [firstName, setFirstname] = useState(fname);
    const [lastName, setLastName] = useState(lname);
    const [tutorial, setTutorial] = useState(true)
    const finishSetup = () => {
        startGame(firstName, lastName, tutorial)
    }
    return (
        <div className="flex flex-col items-center gap-2">
            <h1 className="p-8">Finance Game</h1>
            <div className="flex flex-col items-center gap-2 p-4 bg-amber-100 rounded-xl">
                <h2 className="text-gray-700! p-2">Choose your character name</h2>
                <label className="text-gray-700">
                    First Name: <input name="characterFName" className="w-38 text-gray-700 bg-gray-200 rounded-xl p-1"
                                       defaultValue={firstName}
                                       onChange={e => setFirstname(e.target.value)}
                                       type="text"></input>
                </label>
                <label className="text-gray-700">
                    Last Name: <input name="characterLName" className="w-38 text-gray-700 bg-gray-200 rounded-xl p-1"
                                      defaultValue={lastName}
                                      onChange={e => setLastName(e.target.value)}
                                      type="text"></input>
                </label>
                <button className="w-40 text-xl h-10 font-bold" onClick={() => setTutorial(t => !t)}>{tutorial? "Tutorials" : "No Tutorials"}</button>
                <label className="text-gray-700">Age: 18</label>
                <button className="w-40 text-xl h-10 font-bold mt-4" onClick={finishSetup}>Start</button>
            </div>
        </div>
    )
}

export default SetupPage