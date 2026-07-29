import {type GroupBase, type StylesConfig} from "react-select";
import React, {useEffect, useState} from "react";
import {taxBrackets} from "./Constants.tsx";

export function CalculateTaxes(taxableAmount: number): number {
    let tax = 0;
    for (let i = 0; i < taxBrackets.length; i++) {
        tax += (Math.min(taxBrackets[i].to, taxableAmount) - (taxBrackets[i - 1]?.to ?? 0)) * taxBrackets[i].percent / 100;
        if (taxBrackets[i].to > taxableAmount) break;
    }
    return tax;
}

export function GetDateString(date: Date): string {
    return date.toDateString().substring(date.toDateString().indexOf(" ") + 1);
}

export function GetReactSelectStyle<T>() {
    const style: StylesConfig<T, false, GroupBase<T>> | undefined = {
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
    };
    return style;
}

export function ReplaceYear(date: Date, year: number) {
    return new Date(year, date.getMonth(), date.getDay(), date.getHours(), date.getMinutes(), date.getSeconds());
}

export function CopyDate(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDay(), date.getHours(), date.getMinutes(), date.getSeconds());
}

export type ButtonNextProps = {
    style: string; text: string; action: () => void;
}

export function ButtonNext({style, text, action}: ButtonNextProps) {
    const keyPressed = ((e: KeyboardEvent) => {
        if (e.key == "n") {
            action();
            e.stopPropagation();
        }
    });
    useEffect(() => {
        document.addEventListener("keyup", keyPressed);
        return () => {
            document.removeEventListener("keyup", keyPressed);
        };
    }, []);

    return (
        <button className={style} onClick={action}>
            {text}
        </button>
    );
}

let inputId = 0;

export function NumberInputAutoSelect(props: React.DetailedHTMLProps<React.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>) {
    const [id] = useState(inputId++);
    return (
        <input {...props}
               name="transfer-funds"
               id={"numberinputautoselect" + id}
               min={Math.floor(100 * (props.min === null || props.min === undefined ? Number.MIN_SAFE_INTEGER : props.min as number)) / 100}
               max={Math.ceil(100 * (props.max === null || props.max === undefined ? Number.MAX_SAFE_INTEGER : props.max as number)) / 100}
               onFocus={(e) => {
                   (document.getElementById("numberinputautoselect" + id) as HTMLInputElement)!.select();
                   e.stopPropagation();
               }}
               type="number">
        </input>

    )
}

type ActionProps = {
    action: () => void;
}

export function InfoButton({action}: ActionProps) {
    return (<button
        className=" text-sm/4 pl-1 pr-1 align-middle rounded-16xl bg-transparent! text-blue-700! hover:text-blue-500! font-bold border-blue-700! hover:border-blue-500! border-2!"
        onClick={action}>i
    </button>);
}

type InfoButtonTooltip = {
    action: () => void;
    text: string;
}

export function InfoButtonTooltip({action, text}: InfoButtonTooltip) {
    const [mouseEnter, setMouseEnter] = useState(false)
    return (<button
        className=" text-sm/4 pl-1 pr-1 align-middle rounded-16xl bg-transparent! text-blue-700! hover:text-blue-500! font-bold border-blue-700! hover:border-blue-500! border-2!"
        onClick={action} onMouseEnter={() => setMouseEnter(true)} onMouseLeave={() => setMouseEnter(false)}>i
        <div
            className={"fixed -translate-x-1/2 translate-y-2 text-white bg-gray-500 p-2 rounded-xl transition-opacity pointer-events-none " + (mouseEnter ? "opacity-100" : "opacity-0")}>{text}</div>
    </button>);
}
