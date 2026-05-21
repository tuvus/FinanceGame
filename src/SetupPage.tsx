import './App.css'
import {useState} from "react";

type SetupProps= {
    fname: string; lname: string; startGame: (fname: string, lname: string) => void;
}

function SetupPage({fname, lname, startGame}: SetupProps) {
    const [firstName, setFirstname] = useState(fname);
    const [lastName, setLastName] = useState(lname);
    const finishSetup = () => {
        startGame(firstName, lastName)
    }
    return (
        <div className="flex flex-col items-center gap-2">
            <h1 className="p-8">Finance Game</h1>
            <p>Choose your character name</p>
            <label className="mt-2">
                First Name: <input name="characterFName"
                                   defaultValue={firstName}
                                   onChange={e => setFirstname(e.target.value)}
                                   type="text"></input>
            </label>
            <label>
                Last Name: <input name="characterLName" defaultValue={lastName}
                                  onChange={e => setLastName(e.target.value)}
                                  type="text"></input>
            </label>
            <button className="w-40 text-xl h-10 font-bold" onClick={finishSetup}>Start</button>
        </div>
    )
}

export default SetupPage