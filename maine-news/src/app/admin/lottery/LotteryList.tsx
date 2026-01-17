'use client';

import React, { useState } from 'react';
import { Edit2, Save, X, Ticket, RefreshCw } from 'lucide-react';

export default function LotteryList({ initialResults }: { initialResults: any[] }) {
    const [results, setResults] = useState(initialResults);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<any>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    const handleSync = async () => {
        setIsSyncing(true);
        try {
            const res = await fetch('/api/lottery?force=true');
            if (res.ok) {
                window.location.reload();
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsSyncing(false);
        }
    };

    const handleEdit = (res: any) => {
        setEditingId(res.id);
        setEditForm({ ...res });
    };

    const handleSave = async () => {
        try {
            const res = await fetch('/api/admin/lottery', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (res.ok) {
                setResults(results.map(r => r.id === editForm.id ? editForm : r));
                setEditingId(null);
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-end">
                <button
                    onClick={handleSync}
                    disabled={isSyncing}
                    className="btn-secondary flex items-center gap-2"
                >
                    <RefreshCw size={18} className={isSyncing ? 'animate-spin' : ''} />
                    {isSyncing ? 'Syncing...' : 'Sync with APIs'}
                </button>
            </div>

            <div className="grid gap-4">
                {results.map((res) => (
                    <div key={res.id} className="bg-card border-all rounded-2xl p-6 transition-all">
                        {editingId === res.id ? (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-xl font-bold text-accent uppercase">{res.game}</h3>
                                    <div className="flex gap-2">
                                        <button onClick={handleSave} className="p-2 bg-accent text-black rounded-lg hover:opacity-80">
                                            <Save size={18} />
                                        </button>
                                        <button onClick={() => setEditingId(null)} className="p-2 bg-dim text-dim rounded-lg hover-white">
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-dim uppercase mb-1 block">Winning Numbers (comma separated)</label>
                                        <input
                                            value={editForm.numbers}
                                            onChange={e => setEditForm({ ...editForm, numbers: e.target.value })}
                                            className="w-full bg-muted border-all rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-dim uppercase mb-1 block">Extra / Bonus Ball</label>
                                        <input
                                            value={editForm.extra || ''}
                                            onChange={e => setEditForm({ ...editForm, extra: e.target.value })}
                                            className="w-full bg-muted border-all rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-dim uppercase mb-1 block">Jackpot Amount</label>
                                        <input
                                            value={editForm.jackpot || ''}
                                            onChange={e => setEditForm({ ...editForm, jackpot: e.target.value })}
                                            className="w-full bg-muted border-all rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-dim uppercase mb-1 block">Draw Date</label>
                                        <input
                                            value={editForm.drawDate}
                                            onChange={e => setEditForm({ ...editForm, drawDate: e.target.value })}
                                            className="w-full bg-muted border-all rounded-xl px-4 py-2 text-white"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-dim rounded-xl">
                                        <Ticket size={24} className="text-accent" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white uppercase">{res.game}</h3>
                                        <div className="flex items-center gap-4 mt-1">
                                            <div className="flex gap-1">
                                                {res.numbers.split(',').map((n: string, i: number) => (
                                                    <span key={i} className="text-sm font-mono bg-muted px-2 py-0.5 rounded border-all text-white">
                                                        {n}
                                                    </span>
                                                ))}
                                                {res.extra && (
                                                    <span className="text-sm font-mono bg-accent/20 px-2 py-0.5 rounded border-all border-accent/30 text-accent">
                                                        {res.extra}
                                                    </span>
                                                )}
                                            </div>
                                            {res.jackpot && (
                                                <span className="text-sm font-bold text-accent">{res.jackpot}</span>
                                            )}
                                            <span className="text-xs text-dim">{res.drawDate}</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleEdit(res)} className="p-2 text-dim hover-white">
                                    <Edit2 size={20} />
                                </button>
                            </div>
                        )}
                    </div>
                ))}

                {results.length === 0 && (
                    <div className="text-center py-24 bg-card border-all rounded-3xl" style={{ borderStyle: 'dashed' }}>
                        <p className="text-dim">No lottery results syncing yet. Click "Sync" or add one manually.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
