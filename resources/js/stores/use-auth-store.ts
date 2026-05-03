import { Auth, User } from '@/types';
import { create } from 'zustand';

type AuthActions = {
    setAuth: (auth: Auth | null) => void;
    setLoading: (loading: boolean) => void;
    logout: () => void;
    updateUser: (updates: Partial<User>) => void;
};

interface AuthState {
    auth: Auth | null;
    isAuthenticated: boolean;
    loading: boolean;
    actions: AuthActions;
}

export const useAuthStore = create<AuthState>((set, get) => ({
    auth: null,
    isAuthenticated: false,
    loading: false,
    actions: {
        setAuth: (auth) =>
            set({
                auth,
                isAuthenticated: Boolean(auth?.user),
            }),

        setLoading: (loading) => set({ loading }),

        logout: () =>
            set({
                auth: null,
                isAuthenticated: false,
            }),

        updateUser: (updates) => {
            const currentAuth = get().auth;

            if (currentAuth?.user) {
                set({
                    auth: {
                        ...currentAuth,
                        user: { ...currentAuth.user, ...updates },
                    },
                });
            }
        },
    },
}));

export const useAuth = () => useAuthStore((state) => state.auth);

export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);

export const useAuthLoading = () => useAuthStore((state) => state.loading);

export const useAuthActions = () => useAuthStore((state) => state.actions);

export const useAuthUser = () => useAuthStore((state) => state.auth?.user ?? null);
