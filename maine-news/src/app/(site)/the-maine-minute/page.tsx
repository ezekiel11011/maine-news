import type { Metadata } from 'next';
import MaineMinuteBrief from '@/components/minute/MaineMinuteBrief';
import { buildMaineMinuteReport } from '@/lib/maineMinuteReport';

export const revalidate = 1800;

export async function generateMetadata(): Promise<Metadata> {
    const report = await buildMaineMinuteReport();
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

export default async function MaineMinutePage() {
    const report = await buildMaineMinuteReport();
    return <MaineMinuteBrief report={report} />;
}
