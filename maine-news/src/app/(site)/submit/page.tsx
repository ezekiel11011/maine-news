import SubmitStoryForm from '@/components/article/SubmitStoryForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Submit a Story | Maine News Today',
    description: 'Help us tell Maine’s stories. Submit a tip, photo, or story to our newsroom.',
};

export default function SubmitPage() {
    return (
        <div className="container" style={{ padding: '2rem 1rem' }}>
            <SubmitStoryForm />
        </div>
    );
}
