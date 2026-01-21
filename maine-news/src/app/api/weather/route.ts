import { NextResponse } from 'next/server';
import { getMaineDateString, getWeatherReport, isValidDateParam } from '@/lib/weather';

export const revalidate = 1800;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const dateParam = searchParams.get('date');

        if (dateParam && !isValidDateParam(dateParam)) {
            return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD.' }, { status: 400 });
        }

        const date = dateParam || getMaineDateString();
        const report = await getWeatherReport(date, dateParam ? 86400 : 1800);

        return NextResponse.json(report);
    } catch (error) {
        console.error('Weather API Error:', error);
        return NextResponse.json({ error: 'Failed to load weather report' }, { status: 500 });
    }
}
