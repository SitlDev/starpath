import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                base: "#0d0d0f",
                surface: "#141416",
                elevated: "#1c1c1f",
                accent: "#f59e0b",
                "accent-dim": "#78350f",
                "text-primary": "#faf9f5",
                "text-secondary": "#9ca3af",
                "text-muted": "#4b5563",
                success: "#10b981",
                error: "#ef4444",
            },
            fontFamily: {
                syne: ["var(--font-syne)", "sans-serif"],
                mono: ["var(--font-mono)", "monospace"],
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
            },
        },
    },
    plugins: [],
};
export default config;
