'use client';

import { signOut } from "next-auth/react";
import { LogOut } from 'lucide-react';

export default function SignOutButton() {
    return (
        <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="flex items-center gap-3 px-4 py-2.5 w-full text-sm font-medium text-[#888] hover:text-white hover:bg-red-500/10 rounded-xl transition-all group"
        >
            <LogOut size={18} className="group-hover:rotate-12 transition-transform" />
            <span>Sign Out</span>
        </button>
    );
}
