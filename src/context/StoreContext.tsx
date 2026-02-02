// src/context/StoreContext.tsx
import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

const STORAGE_KEY = "ws-store";

export type StoreCategory = "avatar" | "room";

export type AvatarSlot = "hair" | "top" | "bottom" | "accessory" | "frame";
export type RoomSlot = "wall" | "floor" | "furniture" | "prop";

export type StoreItem = {
  id: string;
  category: StoreCategory;
  name: string;
  description?: string;
  price: number;
  icon: string;
  slot?: AvatarSlot | RoomSlot;
  rarity?: "common" | "rare" | "epic";
};

export type EquippedAvatar = Partial<Record<AvatarSlot, string>>;
export type EquippedRoom = Partial<Record<RoomSlot, string>>;

type StoredState = {
  points: number;
  ownedItemIds: string[];
  equippedAvatar: EquippedAvatar;
  equippedRoom: EquippedRoom;
};

const defaultState: StoredState = {
  points: 1250,
  ownedItemIds: [],
  equippedAvatar: {},
  equippedRoom: {},
};

function loadState(): StoredState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as StoredState;
      return {
        points: typeof parsed.points === "number" ? parsed.points : defaultState.points,
        ownedItemIds: Array.isArray(parsed.ownedItemIds) ? parsed.ownedItemIds : defaultState.ownedItemIds,
        equippedAvatar: parsed.equippedAvatar && typeof parsed.equippedAvatar === "object" ? parsed.equippedAvatar : defaultState.equippedAvatar,
        equippedRoom: parsed.equippedRoom && typeof parsed.equippedRoom === "object" ? parsed.equippedRoom : defaultState.equippedRoom,
      };
    }
  } catch (_) {}
  return { ...defaultState };
}

function saveState(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (_) {}
}

type StoreContextValue = {
  points: number;
  ownedItemIds: string[];
  equippedAvatar: EquippedAvatar;
  equippedRoom: EquippedRoom;
  addPoints: (amount: number) => void;
  spendPoints: (amount: number) => boolean;
  purchaseItem: (itemId: string, price: number) => boolean;
  equipAvatar: (slot: AvatarSlot, itemId: string | null) => void;
  equipRoom: (slot: RoomSlot, itemId: string | null) => void;
  isOwned: (itemId: string) => boolean;
  isEquipped: (itemId: string, category: StoreCategory) => boolean;
};

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<StoredState>(loadState);

  const addPoints = useCallback((amount: number) => {
    setState((prev) => {
      const next = { ...prev, points: Math.max(0, prev.points + amount) };
      saveState(next);
      return next;
    });
  }, []);

  const spendPoints = useCallback((amount: number): boolean => {
    let ok = false;
    setState((prev) => {
      if (prev.points < amount) return prev;
      ok = true;
      const next = { ...prev, points: prev.points - amount };
      saveState(next);
      return next;
    });
    return ok;
  }, []);

  const purchaseItem = useCallback((itemId: string, price: number): boolean => {
    let ok = false;
    setState((prev) => {
      if (prev.points < price || prev.ownedItemIds.includes(itemId)) return prev;
      ok = true;
      const next = {
        ...prev,
        points: prev.points - price,
        ownedItemIds: [...prev.ownedItemIds, itemId],
      };
      saveState(next);
      return next;
    });
    return ok;
  }, []);

  const equipAvatar = useCallback((slot: AvatarSlot, itemId: string | null) => {
    setState((prev) => {
      const next = {
        ...prev,
        equippedAvatar: itemId === null ? { ...prev.equippedAvatar, [slot]: undefined } : { ...prev.equippedAvatar, [slot]: itemId },
      };
      saveState(next);
      return next;
    });
  }, []);

  const equipRoom = useCallback((slot: RoomSlot, itemId: string | null) => {
    setState((prev) => {
      const next = {
        ...prev,
        equippedRoom: itemId === null ? { ...prev.equippedRoom, [slot]: undefined } : { ...prev.equippedRoom, [slot]: itemId },
      };
      saveState(next);
      return next;
    });
  }, []);

  const isOwned = useCallback(
    (itemId: string) => state.ownedItemIds.includes(itemId),
    [state.ownedItemIds]
  );

  const isEquipped = useCallback(
    (itemId: string, category: StoreCategory) => {
      if (category === "avatar") {
        return Object.values(state.equippedAvatar).includes(itemId);
      }
      return Object.values(state.equippedRoom).includes(itemId);
    },
    [state.equippedAvatar, state.equippedRoom]
  );

  const value = useMemo<StoreContextValue>(
    () => ({
      points: state.points,
      ownedItemIds: state.ownedItemIds,
      equippedAvatar: state.equippedAvatar,
      equippedRoom: state.equippedRoom,
      addPoints,
      spendPoints,
      purchaseItem,
      equipAvatar,
      equipRoom,
      isOwned,
      isEquipped,
    }),
    [state, addPoints, spendPoints, purchaseItem, equipAvatar, equipRoom, isOwned, isEquipped]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}

export function useStoreOptional() {
  return useContext(StoreContext);
}
