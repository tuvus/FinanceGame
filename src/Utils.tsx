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
        tax += (Math.min(taxBrackets[i].to, taxableAmount) - (taxBrackets[i-1]?.to ?? 0)) * taxBrackets[i].percent / 100;
        if (taxBrackets[i].to > taxableAmount) break;
    }
    return tax;
}

export function GetDateString(date: Date): string {
    return date.toDateString().substring(date.toDateString().indexOf(" ") + 1);
}