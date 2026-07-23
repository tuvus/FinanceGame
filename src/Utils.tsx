import {type GroupBase, type StylesConfig} from "react-select";
import React, {useEffect, useState} from "react";

export function CalculateTaxes(taxableAmount: number): number {
    const taxBrackets = [
        {percent: 10, to: 11925},
        {percent: 12, to: 48475},
        {percent: 22, to: 103350},
        {percent: 24, to: 197300},
        {percent: 32, to: 250525},
        {percent: 35, to: 626350},
        {percent: 37, to: 999999999999}
    ]
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
    action: () => void; style: string; text: string;
}

export function ButtonNext({action, style, text}: ButtonNextProps) {
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
               max={Math.ceil(100 * (props.max === null || props.max === undefined ? Number.MAX_SAFE_INTEGER : props.max as number)) / 100}
               onFocus={(e) => {
                   (document.getElementById("numberinputautoselect" + id) as HTMLInputElement)!.select();
                   e.stopPropagation();
               }}
               type="number">
        </input>

    )
}