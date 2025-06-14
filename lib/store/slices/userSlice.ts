import { StateCreator } from "zustand";
import { AppState, User, Subscription } from "../types";

export const createUserSlice: StateCreator<AppState, [], [], Partial<AppState>> = (set) => ({
    user: null,
    subscription: null,
    setUser: (user: User | null) => set({ user }),
    setSubscription: (subscription: Subscription | null) => set({ subscription }),
});