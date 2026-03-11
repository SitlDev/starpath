"use client";

import { useState } from "react";
import { CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AppPricingPage() {
    const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

    const handleSubscribe = async (priceId: string, planType: string) => {
        setLoadingPlan(planType);

        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ priceId }),
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned.");
            }
        } catch (err) {
            console.error("Failed to initiate checkout", err);
        } finally {
            setLoadingPlan(null);
        }
    };

    return (
        <div className="min-h-screen bg-base flex flex-col">
            <header className="border-b border-border bg-surface px-6 py-4 flex items-center justify-between sticky top-0 z-10 backdrop-blur-md bg-surface/80">
                <div className="flex items-center gap-6">
                    <Link href="/dashboard" className="text-text-muted hover:text-text-primary transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h2 className="text-xl font-bold font-syne uppercase tracking-tight italic truncate">
                        Manage Plan
                    </h2>
                </div>
            </header>

            <main className="flex-1 py-16 px-6">
                <div className="max-w-4xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter font-syne">Unleash the Engine.</h1>
                        <p className="text-text-secondary font-mono uppercase tracking-widest text-sm">
                            Upgrade to unlock higher minute limits and custom AI tonal training.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Basic Plan */}
                        <div className="card p-12 space-y-8 bg-surface border-border flex flex-col justify-between">
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold font-syne uppercase italic text-text-primary">Basic</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black font-syne italic text-text-primary">$14.99</span>
                                    <span className="text-text-muted font-mono uppercase text-[10px] tracking-widest">/month</span>
                                </div>
                                <ul className="space-y-5">
                                    <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> 75 Upload Minutes / Month
                                    </li>
                                    <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> AI Clips & Shorts Only
                                    </li>
                                </ul>
                            </div>
                            <button
                                disabled={loadingPlan !== null}
                                onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID || '', 'basic')}
                                className="btn-secondary w-full py-4 text-center flex justify-center mt-8"
                            >
                                {loadingPlan === 'basic' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Start 7-Day Free Trial"}
                            </button>
                        </div>

                        {/* Standard Plan */}
                        <div className="card p-12 space-y-8 bg-base/50 flex flex-col justify-between">
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold font-syne uppercase italic text-text-primary">Standard</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black font-syne italic text-text-primary">$49</span>
                                    <span className="text-text-muted font-mono uppercase text-[10px] tracking-widest">/month</span>
                                </div>
                                <ul className="space-y-5">
                                    <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> 300 Upload Minutes / Month
                                    </li>
                                    <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> All Asset Types (Clips, Blogs, Posts)
                                    </li>
                                    <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Viral Score Analysis
                                    </li>
                                </ul>
                            </div>
                            <button
                                disabled={loadingPlan !== null}
                                onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID || '', 'standard')}
                                className="btn-secondary w-full py-4 text-center flex justify-center mt-8"
                            >
                                {loadingPlan === 'standard' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Upgrade Standard"}
                            </button>
                        </div>

                        {/* Professional Plan */}
                        <div className="card p-12 space-y-8 bg-accent/5 border-accent/20 flex flex-col justify-between relative">
                            <div className="absolute top-4 right-4 text-[8px] font-mono uppercase tracking-tighter bg-accent text-base px-2 py-1 rounded">Popular</div>
                            <div className="space-y-8">
                                <h3 className="text-xl font-bold font-syne uppercase italic text-text-primary">Professional</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-5xl font-black font-syne italic text-text-primary">$99</span>
                                    <span className="text-text-muted font-mono uppercase text-[10px] tracking-widest">/month</span>
                                </div>
                                <ul className="space-y-5">
                                    <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> 1,000 Upload Minutes / Month
                                    </li>
                                    <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Custom AI Tone Training
                                    </li>
                                    <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                        <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Priority Webhook Processing
                                    </li>
                                </ul>
                            </div>
                            <button
                                disabled={loadingPlan !== null}
                                onClick={() => handleSubscribe(process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || '', 'pro')}
                                className="btn-primary w-full py-4 text-center flex justify-center mt-8"
                            >
                                {loadingPlan === 'pro' ? <Loader2 className="w-5 h-5 animate-spin" /> : "Go Pro"}
                            </button>
                        </div>
                    </div>

                    <div className="mt-16 text-center p-8 border border-border bg-base/80 rounded-lg max-w-2xl mx-auto">
                        <p className="text-sm font-mono text-text-secondary uppercase tracking-widest leading-relaxed">
                            <span className="text-accent font-bold italic block mb-2 text-base">You're out of Upload Minutes!</span>
                            Upgrade to the next tier or buy 100 Top-Up Minutes for $10.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
