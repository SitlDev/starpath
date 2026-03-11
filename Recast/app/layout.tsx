import type { Metadata } from "next";
import { Syne, DM_Mono } from "next/font/google";
import "./globals.css";

const syne = Syne({
    subsets: ["latin"],
    variable: "--font-syne",
});

const dmMono = DM_Mono({
    weight: ["400", "500"],
    subsets: ["latin"],
    variable: "--font-mono",
});

export const metadata: Metadata = {
    title: "RECAST | One video. Everywhere.",
    description: "Repurpose your long-form content into viral short-form clips with AI.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className={`${syne.variable} ${dmMono.variable}`}>
            <body className="antialiased min-h-screen selection:bg-accent selection:text-base">
                {children}
            </body>
        </html>
    );
}
