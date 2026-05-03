import { create } from 'zustand';

type AppState = {
    notifications: string[];
    setNotifications: (notifications: string[]) => void;
    // add more global state as needed
};

export const useAppStore = create<AppState>((set) => ({
    notifications: [],
    setNotifications: (notifications) => set({ notifications }),
    // add more global state as needed
}));
