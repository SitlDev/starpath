import { create } from 'zustand';

interface AppState {
    activeTab: string;
    alertCount: number;
    user: { name: string, role: string, email: string, superAdmin?: boolean } | null;
    token: string | null;

    // Actions
    setActiveTab: (tab: string) => void;
    setAlertCount: (count: number) => void;
    setUser: (user: any) => void;
    setToken: (token: string | null) => void;
    logout: () => void;
}

export const useStore = create<AppState>((set) => ({
    activeTab: 'dashboard',
    alertCount: 3,
    user: null,
    token: localStorage.getItem('token'),

    setActiveTab: (tab) => set({ activeTab: tab }),
    setAlertCount: (count) => set({ alertCount: count }),
    setUser: (user) => set({ user }),
    setToken: (token) => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
        set({ token });
    },
    logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null, activeTab: 'dashboard' });
    }
}));
