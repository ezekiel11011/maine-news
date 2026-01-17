'use client';

import { signIn } from "next-auth/react";
import { Github, ArrowRight, Mail, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./login.module.css";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleCredentialsLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const result = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError("Invalid email or password");
            } else {
                router.push("/admin");
                router.refresh();
            }
        } catch (err) {
            setError("Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.loginPage}>
            {/* Background Glow */}
            <div className={styles.backgroundGlow} />

            <div className={styles.loginContainer}>
                <div className={styles.header}>
                    <div className={styles.logoWrapper}>
                        <div className={styles.logoGlow} />
                        <div className={styles.logoContainer}>
                            <Image
                                src="/maine-news-now.png"
                                alt="Maine News Now"
                                fill
                                style={{ objectFit: 'contain', padding: '0.5rem' }}
                                priority
                            />
                        </div>
                    </div>
                    <h1 className={styles.title}>Admin Portal</h1>
                    <p className={styles.subtitle}>
                        Enter your credentials or use GitHub to manage Maine News Now.
                    </p>
                </div>

                <div className={styles.card}>
                    {error && (
                        <div className={`${styles.errorBanner} shake`}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleCredentialsLogin} className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Account Email</label>
                            <div className={styles.inputWrapper}>
                                <Mail size={18} className={styles.inputIcon} />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@mainenewsnow.com"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <div className={styles.inputGroup}>
                            <label className={styles.label}>Password</label>
                            <div className={styles.inputWrapper}>
                                <Lock size={18} className={styles.inputIcon} />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={styles.input}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={styles.submitButton}
                        >
                            {loading ? (
                                <div className={styles.spinner} />
                            ) : (
                                <>
                                    Sign In
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    <div className={styles.divider}>
                        <div className={styles.dividerLine}>
                            <span className={styles.line}></span>
                        </div>
                        <div className={styles.dividerTextWrapper}>
                            <span className={styles.dividerText}>Social Authentication</span>
                        </div>
                    </div>

                    <button
                        onClick={() => signIn("github", { callbackUrl: "/admin" })}
                        className={styles.githubButton}
                    >
                        <Github size={20} />
                        Continue with GitHub
                    </button>

                    <p className={styles.footerText}>
                        Secured by Maine News Now Internal Protocols.
                        All access attempts are audited.
                    </p>
                </div>

                <div className={styles.backLinkWrapper}>
                    <Link href="/" className={styles.backLink}>
                        ← Back to Maine News Now
                    </Link>
                </div>
            </div>
        </div>
    );
}
