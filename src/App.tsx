import './App.css'
import SetupPage from "./SetupPage.tsx";
import random from "random";
import {useState} from "react";
import GamePage from "./GamePage.tsx";
import {femaleNames, lastNames, maleNames} from "./Constants.tsx";

function App() {

    const [firstName, setFirstname] = useState(
        random.boolean() ? maleNames[random.int(0, maleNames.length - 1)] : femaleNames[random.int(0, femaleNames.length - 1)]);
    const [lastName, setLastName] = useState(
        lastNames[random.int(0, lastNames.length - 1)]);
    const [tutorial, setTutorial] = useState(true);

    const [page, setPage] = useState("start");
    const startGame = (fName: string, lName: string, tutorial: boolean) => {
        setFirstname(fName);
        setLastName(lName);
        setTutorial(tutorial);
        setPage("game");
    };

    const getPageElement = () => {
        if (page == "game") return <GamePage fname={firstName} lname={lastName} tutorial={tutorial}/>;
        return <SetupPage fname={firstName} lname={lastName} startGame={startGame}/>;
    }

    return (
        <>
            {getPageElement()}
        </>
    )
}

export default App
