import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TenantBranding {
    slug: string;
    companyName: string;
    logoUrl: string | null;
    primaryColor: string;
    plan: string;
}

interface TenantContextValue {
    branding: TenantBranding;
    isLoading: boolean;
    refresh: () => void;
}

// ─── Defaults ─────────────────────────────────────────────────────────────────

const CHARTERBOOK_DEFAULTS: TenantBranding = {
    slug: 'default',
    companyName: 'CharterBook',
    logoUrl: null,
    primaryColor: '#7c3aed',
    plan: 'starter',
};

// ─── CSS Variable Injection ───────────────────────────────────────────────────
// Converts a hex color to r, g, b components for use in rgba() expressions.

function hexToRgb(hex: string): string {
    const clean = hex.replace('#', '');
    const r = parseInt(clean.substring(0, 2), 16);
    const g = parseInt(clean.substring(2, 4), 16);
    const b = parseInt(clean.substring(4, 6), 16);
    return `${r}, ${g}, ${b}`;
}

function applyBrandingToDOM(branding: TenantBranding) {
    const root = document.documentElement;
    const color = branding.primaryColor;
    const rgb = hexToRgb(color);

    root.style.setProperty('--brand-primary', color);
    root.style.setProperty('--brand-primary-rgb', rgb);
    root.style.setProperty('--brand-primary-muted', `rgba(${rgb}, 0.12)`);
    root.style.setProperty('--brand-primary-border', `rgba(${rgb}, 0.25)`);

    // Page title
    document.title = `${branding.companyName} Ops`;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const TenantContext = createContext<TenantContextValue>({
    branding: CHARTERBOOK_DEFAULTS,
    isLoading: true,
    refresh: () => { },
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [branding, setBranding] = useState<TenantBranding>(CHARTERBOOK_DEFAULTS);
    const [isLoading, setIsLoading] = useState(true);

    const fetchBranding = useCallback(async () => {
        try {
            const res = await fetch('/api/tenant/branding');
            if (!res.ok) throw new Error('Branding fetch failed');
            const data: TenantBranding = await res.json();
            setBranding(data);
            applyBrandingToDOM(data);
        } catch {
            // If backend is unavailable, fall back to defaults and still apply them
            applyBrandingToDOM(CHARTERBOOK_DEFAULTS);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchBranding();
    }, [fetchBranding]);

    return (
        <TenantContext.Provider value={{ branding, isLoading, refresh: fetchBranding }}>
            {children}
        </TenantContext.Provider>
    );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useTenant = (): TenantContextValue => useContext(TenantContext);
