import Link from "next/link";
import Image from "next/image";
import {
    Zap,
    Globe,
    TrendingUp,
    CheckCircle,
    ArrowRight,
    Video,
    Twitter,
    Linkedin,
    Instagram,
    Mail,
    PlayCircle
} from "lucide-react";

export const metadata = {
    title: "RECAST | AI Video Repurposing for Content Creators",
    description: "Repurpose your long-form videos into viral clips, threads, blogs, and posts in seconds. The all-in-one AI engine for YouTubers, Podcasters, and Course Creators.",
};

export default function LandingPage() {
    return (
        <div className="bg-base text-text-primary selection:bg-accent selection:text-base selection:font-bold">
            {/* Navigation */}
            <nav className="fixed top-0 w-full z-50 border-b border-border bg-base/80 backdrop-blur-xl px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black italic uppercase tracking-tighter font-syne hover:text-accent transition-colors">
                        RECAST
                    </Link>
                    <div className="hidden md:flex items-center gap-8 text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted">
                        <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
                        <a href="#workflow" className="hover:text-text-primary transition-colors">Workflow</a>
                        <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-[10px] font-mono uppercase tracking-[0.2em] text-text-muted hover:text-text-primary transition-colors px-4 py-2">
                            Login
                        </Link>
                        <Link href="/signup" className="btn-primary py-2 px-6 text-xs">
                            Get Started
                        </Link>
                    </div>
                </div>
            </nav>

            <main>
                {/* Hero Section */}
                <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                    <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div className="space-y-10 relative z-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] uppercase tracking-widest animate-in fade-in slide-in-from-bottom-2 duration-700">
                                <Zap className="w-3 h-3 animate-pulse" />
                                Next-Gen Content Strategy
                            </div>
                            <h1 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter font-syne leading-[0.9] animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                                One Video.<br />
                                <span className="text-accent underline underline-offset-8">Everywhere.</span>
                            </h1>
                            <p className="text-xl md:text-2xl text-text-secondary font-medium leading-relaxed max-w-xl animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                                Stop wasting hours editing. Recast uses Claude 3.5 to transform your long-form videos into a multi-platform content engine in seconds.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
                                <Link href="/signup" className="btn-primary py-5 px-10 text-lg group flex items-center justify-center gap-3">
                                    Start 7-Day Free Trial
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link href="#demo" className="btn-secondary py-5 px-10 text-lg flex items-center justify-center gap-3 group">
                                    <PlayCircle className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    See It In Action
                                </Link>
                            </div>
                            <div className="flex items-center gap-6 pt-4 text-[10px] font-mono text-text-muted uppercase tracking-[0.2em]">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    5 Free Recasts
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    Credit Card Required
                                </div>
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-4 h-4 text-accent" />
                                    Cancel Anytime
                                </div>
                            </div>
                        </div>

                        <div className="relative animate-in zoom-in-95 fade-in duration-1000 delay-100">
                            <div className="absolute -inset-1 bg-gradient-to-r from-accent/20 to-transparent blur-3xl opacity-30 rounded-full" />
                            <div className="card border-accent/10 shadow-2xl overflow-hidden transform lg:rotate-2 hover:rotate-0 transition-all duration-700">
                                <img
                                    src="/Users/amn/.gemini/antigravity/brain/698e381e-6324-4f24-a30f-520b57472cb7/recast_dashboard_mockup_1772708700715.png"
                                    alt="Recast Dashboard Mockup"
                                    className="w-full h-auto"
                                />
                            </div>
                            {/* Floating badges */}
                            <div className="absolute -top-8 -right-8 card p-4 animate-bounce duration-[3000ms] hidden md:block">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">Viral Score</p>
                                        <p className="text-xl font-black font-syne italic text-success">89%</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Logo Cloud / Trust */}
                <section className="py-12 border-y border-border bg-surface/30">
                    <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-8">
                        <span className="text-[10px] font-mono uppercase tracking-[0.4em] text-text-muted">Powering the worlds top creators</span>
                        <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                            <span className="text-2xl font-black italic font-syne">YOUTUBE</span>
                            <span className="text-2xl font-black italic font-syne">PODCAST</span>
                            <span className="text-2xl font-black italic font-syne">TWITCH</span>
                            <span className="text-2xl font-black italic font-syne">WISTIA</span>
                            <span className="text-2xl font-black italic font-syne">VIMEO</span>
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section id="features" className="py-32 px-6">
                    <div className="max-w-7xl mx-auto space-y-24">
                        <div className="max-w-2xl space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter font-syne">
                                Built for the <br /><span className="text-accent underline">Modern Archive.</span>
                            </h2>
                            <p className="text-lg text-text-secondary font-mono uppercase tracking-wider">
                                Stop publishing once. Start dominating everywhere.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="card p-10 space-y-6 hover:bg-elevated/50 transition-colors group border-border/50">
                                <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Instagram className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold font-syne uppercase italic">Short-Form Clips</h3>
                                <p className="text-text-secondary font-mono text-sm leading-relaxed uppercase tracking-tight">
                                    Instant hooks and scripts for IG Reels, TikTok, and YouTube Shorts. Calibrated for maximum retention.
                                </p>
                            </div>

                            <div className="card p-10 space-y-6 hover:bg-elevated/50 transition-colors group border-border/50">
                                <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Twitter className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold font-syne uppercase italic">Viral Threads</h3>
                                <p className="text-text-secondary font-mono text-sm leading-relaxed uppercase tracking-tight">
                                    Automatically distill your deep-dive videos into high-engagement Twitter/X threads that drive followers.
                                </p>
                            </div>

                            <div className="card p-10 space-y-6 hover:bg-elevated/50 transition-colors group border-border/50">
                                <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Globe className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold font-syne uppercase italic">SEO Blog Posts</h3>
                                <p className="text-text-secondary font-mono text-sm leading-relaxed uppercase tracking-tight">
                                    Expand your reach with SEO-optimized blog posts generated directly from your video transcript.
                                </p>
                            </div>

                            <div className="card p-10 space-y-6 hover:bg-elevated/50 transition-colors group border-border/50">
                                <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Linkedin className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold font-syne uppercase italic">Professional Posts</h3>
                                <p className="text-text-secondary font-mono text-sm leading-relaxed uppercase tracking-tight">
                                    Build authority on LinkedIn with industry-calibrated posts that actually get read.
                                </p>
                            </div>

                            <div className="card p-10 space-y-6 hover:bg-elevated/50 transition-colors group border-border/50">
                                <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <Mail className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold font-syne uppercase italic">Newsletters</h3>
                                <p className="text-text-secondary font-mono text-sm leading-relaxed uppercase tracking-tight">
                                    Keep your audience engaged with weekly email summaries formatted for high click-through rates.
                                </p>
                            </div>

                            <div className="card p-10 space-y-6 hover:bg-elevated/50 transition-colors group border-border/50">
                                <div className="w-14 h-14 rounded-lg bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <TrendingUp className="w-7 h-7 text-accent" />
                                </div>
                                <h3 className="text-xl font-bold font-syne uppercase italic">Viral Score</h3>
                                <p className="text-text-secondary font-mono text-sm leading-relaxed uppercase tracking-tight">
                                    Our proprietary AI analyzes your content and predicts performance before you even hit publish.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Workflow Section */}
                <section id="workflow" className="py-32 border-t border-border/50 bg-base">
                    <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                        <div className="space-y-12">
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter font-syne">
                                Three Steps. <br /><span className="text-accent underline">Zero Friction.</span>
                            </h2>
                            <div className="space-y-10">
                                <div className="flex gap-8 group">
                                    <div className="text-5xl font-syne font-black italic text-accent opacity-10 group-hover:opacity-100 transition-opacity duration-500">01</div>
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-bold font-syne uppercase italic tracking-wide">The Ingest</h4>
                                        <p className="text-text-secondary font-mono text-xs uppercase tracking-tight leading-relaxed max-w-sm">
                                            Drop an .MP4 or paste any social link. Our engine extracts studio-quality audio in the background.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-8 group">
                                    <div className="text-5xl font-syne font-black italic text-accent opacity-10 group-hover:opacity-100 transition-opacity duration-500">02</div>
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-bold font-syne uppercase italic tracking-wide">The Analysis</h4>
                                        <p className="text-text-secondary font-mono text-xs uppercase tracking-tight leading-relaxed max-w-sm">
                                            Our smart engine scans your transcript for viral moments, hooks, and deep insights.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-8 group">
                                    <div className="text-5xl font-syne font-black italic text-accent opacity-10 group-hover:opacity-100 transition-opacity duration-500">03</div>
                                    <div className="space-y-3">
                                        <h4 className="text-xl font-bold font-syne uppercase italic tracking-wide">The Bundle</h4>
                                        <p className="text-text-secondary font-mono text-xs uppercase tracking-tight leading-relaxed max-w-sm">
                                            Get a 7-asset bundle with a 7-day posting calendar. Copy, paste, and watch your following grow.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-accent/5 rounded-2xl -rotate-2" />
                            <div className="card p-12 space-y-8 relative bg-surface border-border shadow-2xl">
                                <div className="flex items-center justify-between border-b border-border pb-6">
                                    <span className="text-[10px] font-mono text-accent uppercase tracking-widest">Processing Engine</span>
                                    <div className="flex gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-mono uppercase text-text-muted tracking-widest">
                                            <span>Transcription</span>
                                            <span className="text-success">Done</span>
                                        </div>
                                        <div className="h-1 w-full bg-base rounded-full overflow-hidden border border-border/50">
                                            <div className="h-full bg-success w-full" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-mono uppercase text-text-muted tracking-widest">
                                            <span>Viral Analysis</span>
                                            <span className="text-success">Done</span>
                                        </div>
                                        <div className="h-1 w-full bg-base rounded-full overflow-hidden border border-border/50">
                                            <div className="h-full bg-success w-full" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-mono uppercase text-accent tracking-widest">
                                            <span>Generating Assets</span>
                                            <span className="animate-pulse">Active</span>
                                        </div>
                                        <div className="h-1 w-full bg-base rounded-full overflow-hidden border border-border/50">
                                            <div className="h-full bg-accent w-2/3 animate-[shimmer_2s_infinite]" />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-4 grid grid-cols-2 gap-4">
                                    <div className="h-12 bg-base rounded border border-border/30 flex items-center justify-center p-3">
                                        <div className="w-full h-1 bg-border/20 rounded" />
                                    </div>
                                    <div className="h-12 bg-base rounded border border-border/30 flex items-center justify-center p-3">
                                        <div className="w-full h-1 bg-border/20 rounded" />
                                    </div>
                                    <div className="h-12 bg-base rounded border border-border/30 flex items-center justify-center p-3">
                                        <div className="w-full h-1 bg-border/20 rounded" />
                                    </div>
                                    <div className="h-12 bg-base rounded border border-border/30 flex items-center justify-center p-3 animate-pulse">
                                        <div className="w-full h-1 bg-accent/20 rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                {/* Pricing / CTA Section */}
                <section id="pricing" className="py-32 px-6 bg-surface/20">
                    <div className="max-w-7xl mx-auto space-y-20">
                        <div className="text-center space-y-4">
                            <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter font-syne">Simple Pricing.</h2>
                            <p className="text-text-secondary font-mono uppercase tracking-widest">Pay only for what you recast.</p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {/* Basic Tier */}
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
                                <Link href="/signup" className="btn-secondary w-full py-4 text-center mt-8">Start 7-Day Free Trial</Link>
                            </div>

                            {/* Standard Tier */}
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
                                            <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> All Asset Types
                                        </li>
                                        <li className="flex items-start gap-3 text-xs font-mono uppercase text-text-secondary">
                                            <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Viral Score Analysis
                                        </li>
                                    </ul>
                                </div>
                                <Link href="/signup" className="btn-secondary w-full py-4 text-center mt-8">Get Started</Link>
                            </div>

                            {/* Professional Tier */}
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
                                            <CheckCircle className="w-4 h-4 text-accent shrink-0 mt-0.5" /> Team Collaboration
                                        </li>
                                    </ul>
                                </div>
                                <Link href="/signup" className="btn-primary w-full py-4 text-center mt-8">Go Pro</Link>
                            </div>
                        </div>

                        <div className="mt-16 text-center p-8 border border-border bg-base/80 rounded-lg max-w-2xl mx-auto">
                            <p className="text-sm font-mono text-text-secondary uppercase tracking-widest leading-relaxed">
                                <span className="text-accent font-bold italic block mb-2 text-base">You're out of Upload Minutes!</span>
                                Upgrade to the next tier or buy 100 Top-Up Minutes for $10.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Call to Action */}
                <section id="demo" className="py-32 px-6">
                    <div className="max-w-7xl mx-auto card p-20 bg-accent flex flex-col items-center text-center space-y-10 relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 to-transparent opacity-30 pointer-events-none" />
                        <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter font-syne text-base leading-none relative z-10">
                            Stop Editing. <br />Start Growing.
                        </h2>
                        <p className="text-xl md:text-2xl text-base/80 font-mono uppercase tracking-widest max-w-2xl relative z-10">
                            Join 1,000+ creators who are saving 20+ hours a week with Recast.
                        </p>
                        <Link href="/signup" className="bg-base text-text-primary px-12 py-6 text-xl font-black italic uppercase tracking-widest hover:scale-105 transition-transform relative z-10 rounded-md">
                            Start 7-Day Free Trial
                        </Link>
                    </div>
                </section>
            </main>

            <footer className="border-t border-border bg-surface px-6 py-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
                    <div className="space-y-6">
                        <span className="text-3xl font-black italic uppercase tracking-tighter font-syne">RECAST</span>
                        <p className="text-text-muted font-mono text-[10px] uppercase tracking-widest leading-relaxed">
                            The editorial content engine for the creators of tomorrow. Made in the digital newsroom.
                        </p>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-primary">Product</h4>
                        <ul className="space-y-4 text-[10px] font-mono uppercase tracking-widest text-text-muted">
                            <li><Link href="/recast" className="hover:text-accent transition-colors">Ingest Engine</Link></li>
                            <li><Link href="#features" className="hover:text-accent transition-colors">Repurposing Bundle</Link></li>
                            <li><Link href="#pricing" className="hover:text-accent transition-colors">Viral Score</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-primary">Resources</h4>
                        <ul className="space-y-4 text-[10px] font-mono uppercase tracking-widest text-text-muted">
                            <li><a href="#" className="hover:text-accent transition-colors">Content Strategy</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Claude 3.5 Tips</a></li>
                            <li><a href="#" className="hover:text-accent transition-colors">Whisper API Guide</a></li>
                        </ul>
                    </div>
                    <div className="space-y-6">
                        <h4 className="text-[10px] font-mono uppercase tracking-[0.3em] text-text-primary">Creator Newsletter</h4>
                        <div className="flex bg-base border border-border p-1 rounded">
                            <input type="email" placeholder="YOUR@EMAIL.COM" className="bg-transparent border-none focus:ring-0 text-[10px] font-mono w-full px-3" />
                            <button className="btn-primary py-2 px-4 text-[10px]">JOIN</button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-border/50 text-center">
                    <p className="text-[10px] font-mono text-text-muted uppercase tracking-widest">
                        © 2026 RECAST TECHNOLOGIES. ALL RIGHTS RESERVED.
                    </p>
                </div>
            </footer>
        </div >
    );
}
