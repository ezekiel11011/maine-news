import type { Metadata } from 'next';
import { getMaineDateString, getWeatherReport } from '@/lib/weather';
import WeatherReport from './WeatherReport';

export const metadata: Metadata = {
    title: 'Maine Weather Report | Maine News Now',
    description: 'Daily Maine weather report sourced from the National Weather Service (NOAA).',
};

export const revalidate = 1800;

export default async function WeatherPage() {
    const reportDate = getMaineDateString();
    const report = await getWeatherReport(reportDate, 1800);

    return <WeatherReport report={report} />;
}
