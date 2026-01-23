import { redirect } from 'next/navigation';

interface MinuteDatePageProps {
    params: Promise<{ date: string }>;
}

export default async function MaineMinuteDatePage({ params }: MinuteDatePageProps) {
    const { date } = await params;
    redirect(`/the-maine-minute/${date}`);
}
