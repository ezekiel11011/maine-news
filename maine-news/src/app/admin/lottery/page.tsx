import React from 'react';
import { db } from '@/db';
import { lotteryResults } from '@/db/schema';
import { Ticket } from 'lucide-react';
import LotteryList from './LotteryList';

export const dynamic = 'force-dynamic';

export default async function LotteryAdminPage() {
    const results = await db.query.lotteryResults.findMany();

    return (
        <div className="space-y-8 animate-in fade-in">
            <div className="flex border-b pb-8 justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Lottery Management</h1>
                    <p className="text-dim mt-1">Manage winning numbers and jackpots for all games.</p>
                </div>
            </div>

            <LotteryList initialResults={results} />
        </div>
    );
}
