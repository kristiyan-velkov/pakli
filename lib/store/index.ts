import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AppState } from "./types";
import { createOutageSlice,  } from "./slices/outageSlice";
import { createMapSlice } from "./slices/mapSlice";
import { createUserSlice } from "./slices/userSlice";

export const useAppStore = create<AppState>()(
    persist(
        (...a) => ({
            ...createUserSlice(...a),
            ...createOutageSlice(...a),
            ...createMapSlice(...a),
        }),
        {
            name: "pakli-storage",
            partialize: (state) => ({
                user: state.user,
                subscription: state.subscription,
                mapType: state.mapType,
                viewMode: state.viewMode,
            }),
        }
    )
);
