import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getWeatherReport, isValidDateParam } from '@/lib/weather';
import WeatherReport from '../WeatherReport';

export const revalidate = 86400;

interface WeatherDatePageProps {
    params: {
        date: string;
    };
}

export async function generateMetadata({ params }: WeatherDatePageProps): Promise<Metadata> {
    return {
        title: `Maine Weather Report - ${params.date} | Maine News Now`,
        description: 'Daily Maine weather report sourced from the National Weather Service (NOAA).',
    };
}

export default async function WeatherDatePage({ params }: WeatherDatePageProps) {
    if (!isValidDateParam(params.date)) {
        notFound();
    }

    const report = await getWeatherReport(params.date, 86400);

    return <WeatherReport report={report} />;
}
