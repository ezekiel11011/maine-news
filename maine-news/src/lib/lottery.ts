export interface LotteryResult {
    game: string;
    numbers: string[];
    extra?: string;
    jackpot?: string;
    date: string;
    source?: 'db' | 'api' | 'mock';
}

export const getLatestLotteryResults = async (): Promise<LotteryResult[]> => {
    let apiData: any = {};
    try {
        const res = await fetch('/api/lottery');
        if (res.ok) {
            apiData = await res.json();
        }
    } catch (e) {
        console.error("Failed to fetch real-time lottery data:", e);
    }

    const results: LotteryResult[] = [];

    // 1. Powerball & Mega Millions (Standard)
    if (apiData.powerball) results.push(apiData.powerball);
    if (apiData.megamillions) results.push(apiData.megamillions);

    // 2. MUSL Multi-State Games
    if (apiData.luckyForLife) results.push(apiData.luckyForLife);
    if (apiData.lottoAmerica) results.push(apiData.lottoAmerica);
    if (apiData.doublePlay) results.push(apiData.doublePlay);

    // 3. Maine State Games (DB/Admin Managed)
    if (apiData.megabucks) results.push(apiData.megabucks);
    if (apiData.gimme5) results.push(apiData.gimme5);
    if (apiData.pick4) results.push(apiData.pick4);
    if (apiData.pick3) results.push(apiData.pick3);

    // FALLBACK: If API fails completely, show standard mocks so UI isn't empty
    if (results.length === 0) {
        return [
            {
                game: "Powerball",
                numbers: ["12", "24", "33", "45", "56"],
                extra: "10",
                jackpot: "$420 Million",
                date: "Jan 16, 2026",
                source: 'mock'
            },
            {
                game: "Mega Millions",
                numbers: ["05", "18", "21", "44", "62"],
                extra: "03",
                jackpot: "$157 Million",
                date: "Jan 14, 2026",
                source: 'mock'
            }
        ];
    }

    return results;
};
