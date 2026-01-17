import { NextResponse } from 'next/server';
import { db } from '@/db';
import { lotteryResults } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export const revalidate = 7200; // 2 hours

async function getDbResult(game: string) {
    try {
        const results = await db.select().from(lotteryResults).where(eq(lotteryResults.game, game)).limit(1);
        return results[0] || null;
    } catch (e) { return null; }
}

async function saveDbResult(game: string, data: any) {
    if (!data || !data.numbers || data.numbers.length === 0) return;
    try {
        const existing = await getDbResult(game);
        const numbersStr = data.numbers.join(',');

        if (existing) {
            await db.update(lotteryResults)
                .set({
                    numbers: numbersStr,
                    extra: data.extra || null,
                    jackpot: data.jackpot || null,
                    drawDate: data.date,
                    updatedAt: new Date()
                })
                .where(eq(lotteryResults.game, game));
        } else {
            await db.insert(lotteryResults).values({
                game,
                numbers: numbersStr,
                extra: data.extra || null,
                jackpot: data.jackpot || null,
                drawDate: data.date
            });
        }
    } catch (e) { console.error(`DB Save Error (${game}):`, e); }
}

async function fetchApiVerve(type: 'powerball' | 'megamillions') {
    const apiKey = process.env.APIVERVE_API_KEY;
    if (!apiKey) return null;
    try {
        const res = await fetch(`https://api.apiverve.com/v1/lottery?numbers=${type}`, {
            headers: { 'X-API-Key': apiKey, 'Accept': 'application/json' }
        });
        const json = await res.json();
        if (json.status === 'ok' && json.data) {
            const data = {
                game: type === 'powerball' ? 'Powerball' : 'Mega Millions',
                numbers: json.data.numbers.slice(0, -1).map(String).sort((a: string, b: string) => parseInt(a) - parseInt(b)),
                extra: String(json.data.numbers[json.data.numbers.length - 1]),
                jackpot: json.data.jackpot,
                date: json.data.drawDate
            };
            await saveDbResult(type, data);
            return data;
        }
    } catch (e) { console.error(`ApiVerve Error (${type}):`, e); }
    return null;
}

async function fetchMUSLGame(gameCode: string) {
    const apiKey = process.env.MUSL_API_KEY;
    if (!apiKey) return null;
    try {
        const res = await fetch(`https://api.musl.com/v3/numbers?GameCode=${gameCode}`, {
            headers: { 'x-api-key': apiKey, 'accept': 'application/json' }
        });
        if (!res.ok) return null;

        const data = await res.json();
        if (data && data.numbers) {
            const sortedNums = [...data.numbers].sort((a, b) => (a.orderDrawn || 0) - (b.orderDrawn || 0));

            // MUSL Standard: Main balls are "white-balls" or "black-balls" (plural)
            // Extra balls are "powerball" or "lucky-ball" (singular)
            const mainNumbers = sortedNums
                .filter(n => n.ruleCode.endsWith('balls'))
                .map(n => n.value)
                .sort((a, b) => parseInt(a) - parseInt(b));

            const extraBall = sortedNums.find(n =>
                !n.ruleCode.endsWith('balls') &&
                n.itemCode !== 'power-play' &&
                n.itemCode !== 'megaplier'
            )?.value;

            const parsed = {
                game: data.game?.name || gameCode,
                numbers: mainNumbers,
                extra: extraBall,
                jackpot: data.grandPrize?.prizeText || undefined,
                date: data.drawDate
            };

            await saveDbResult(gameCode, parsed);
            return parsed;
        }
    } catch (e) { console.error(`❌ MUSL Error (${gameCode}):`, e); }
    return null;
}

async function getGameResult(game: string, fetchFn: () => Promise<any>, force: boolean = false) {
    const dbRes = await getDbResult(game);
    if (dbRes && !force) {
        const age = new Date().getTime() - new Date(dbRes.updatedAt).getTime();
        if (age < 7200000) {
            return {
                game: dbRes.game,
                numbers: dbRes.numbers.split(','),
                extra: dbRes.extra,
                jackpot: dbRes.jackpot,
                date: dbRes.drawDate,
                source: 'db'
            };
        }
    }
    return await fetchFn();
}

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';

    const [lfl, la, dp] = await Promise.all([
        getGameResult('lucky-for-life', () => fetchMUSLGame('lucky-for-life'), force),
        getGameResult('lotto-america', () => fetchMUSLGame('lotto-america'), force),
        getGameResult('pb-double-play', () => fetchMUSLGame('pb-double-play'), force),
    ]);

    const [pb, mm] = await Promise.all([
        getGameResult('powerball', () => fetchApiVerve('powerball'), force),
        getGameResult('megamillions', () => fetchApiVerve('megamillions'), force),
    ]);

    const [mb, g5, p4, p3] = await Promise.all([
        getDbResult('megabucks-plus'),
        getDbResult('gimme-5'),
        getDbResult('pick-4'),
        getDbResult('pick-3'),
    ]);

    const formatDb = (res: any) => res ? ({
        game: res.game,
        numbers: res.numbers.split(','),
        extra: res.extra,
        jackpot: res.jackpot,
        date: res.drawDate,
        source: 'db'
    }) : null;

    return NextResponse.json({
        powerball: pb,
        megamillions: mm,
        luckyForLife: lfl,
        lottoAmerica: la,
        doublePlay: dp,
        megabucks: formatDb(mb),
        gimme5: formatDb(g5),
        pick4: formatDb(p4),
        pick3: formatDb(p3)
    });
}
