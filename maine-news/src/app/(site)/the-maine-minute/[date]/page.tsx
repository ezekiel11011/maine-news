import type { Metadata } from 'next';
import MaineMinuteBrief from '@/components/minute/MaineMinuteBrief';
import { buildMaineMinuteReport } from '@/lib/maineMinuteReport';

export const revalidate = 1800;

interface MaineMinuteDatePageProps {
    params: Promise<{ date: string }>;
}

export async function generateMetadata({ params }: MaineMinuteDatePageProps): Promise<Metadata> {
    const { date } = await params;
    const report = await buildMaineMinuteReport(date);
    const dateLabel = new Date(report.date).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    return {
        title: `The Maine Minute — ${dateLabel} | Maine News Now`,
        description: report.subhead,
        openGraph: {
            title: `The Maine Minute — ${dateLabel}`,
            description: report.subhead,
            type: 'article'
        }
    };
}

export default async function MaineMinuteDatePage({ params }: MaineMinuteDatePageProps) {
    const { date } = await params;
    const report = await buildMaineMinuteReport(date);

    return <MaineMinuteBrief report={report} />;
}
