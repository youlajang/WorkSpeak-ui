// src/views/StoreView.tsx
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  useStoreOptional,
  type StoreItem,
  type StoreCategory,
  type AvatarSlot,
  type RoomSlot,
} from "../context/StoreContext";

// Demo catalog: Avatar + Room items
const STORE_ITEMS: StoreItem[] = [
  // Avatar
  { id: "av-hair-default", category: "avatar", name: "Basic hair", price: 0, icon: "👤", slot: "hair", rarity: "common" },
  { id: "av-hair-1", category: "avatar", name: "Curly style", price: 80, icon: "🧑‍🦱", slot: "hair", rarity: "common" },
  { id: "av-hair-2", category: "avatar", name: "Pony tail", price: 100, icon: "👩", slot: "hair", rarity: "rare" },
  { id: "av-top-default", category: "avatar", name: "Basic top", price: 0, icon: "👕", slot: "top", rarity: "common" },
  { id: "av-top-1", category: "avatar", name: "Blazer", price: 150, icon: "🤵", slot: "top", rarity: "rare" },
  { id: "av-top-2", category: "avatar", name: "Hoodie", price: 120, icon: "🧥", slot: "top", rarity: "common" },
  { id: "av-bottom-default", category: "avatar", name: "Basic bottom", price: 0, icon: "👖", slot: "bottom", rarity: "common" },
  { id: "av-bottom-1", category: "avatar", name: "Smart pants", price: 130, icon: "👔", slot: "bottom", rarity: "rare" },
  { id: "av-acc-1", category: "avatar", name: "Glasses", price: 90, icon: "👓", slot: "accessory", rarity: "common" },
  { id: "av-acc-2", category: "avatar", name: "Headphones", price: 110, icon: "🎧", slot: "accessory", rarity: "rare" },
  { id: "av-frame-1", category: "avatar", name: "Gold frame", price: 200, icon: "🖼️", slot: "frame", rarity: "epic" },
  { id: "av-frame-2", category: "avatar", name: "Leaf frame", price: 140, icon: "🍃", slot: "frame", rarity: "rare" },
  // Room
  { id: "rm-wall-default", category: "room", name: "White wall", price: 0, icon: "⬜", slot: "wall", rarity: "common" },
  { id: "rm-wall-1", category: "room", name: "Sky blue", price: 100, icon: "🩵", slot: "wall", rarity: "common" },
  { id: "rm-wall-2", category: "room", name: "Warm beige", price: 120, icon: "🟫", slot: "wall", rarity: "rare" },
  { id: "rm-floor-default", category: "room", name: "Basic floor", price: 0, icon: "▫️", slot: "floor", rarity: "common" },
  { id: "rm-floor-1", category: "room", name: "Wood floor", price: 150, icon: "🪵", slot: "floor", rarity: "rare" },
  { id: "rm-floor-2", category: "room", name: "Carpet", price: 130, icon: "🟤", slot: "floor", rarity: "common" },
  { id: "rm-furn-1", category: "room", name: "Desk lamp", price: 80, icon: "🪔", slot: "furniture", rarity: "common" },
  { id: "rm-furn-2", category: "room", name: "Bookshelf", price: 180, icon: "📚", slot: "furniture", rarity: "epic" },
  { id: "rm-prop-1", category: "room", name: "Plant", price: 70, icon: "🪴", slot: "prop", rarity: "common" },
  { id: "rm-prop-2", category: "room", name: "Poster", price: 95, icon: "🖼️", slot: "prop", rarity: "rare" },
];

const LOW_BALANCE_THRESHOLD = 100;

const ITEMS_BY_ID = Object.fromEntries(STORE_ITEMS.map((i) => [i.id, i]));

function StoreViewWithContext() {
  const nav = useNavigate();
  const store = useStoreOptional();

  const [tab, setTab] = useState<StoreCategory>("avatar");
  const [confirmItem, setConfirmItem] = useState<StoreItem | null>(null);
  const [equipItem, setEquipItem] = useState<StoreItem | null>(null);

  const points = store?.points ?? 1250;
  const canAfford = (price: number) => points >= price;
  const isLowBalance = points < LOW_BALANCE_THRESHOLD;

  const items = useMemo(() => STORE_ITEMS.filter((i) => i.category === tab), [tab]);

  const avatarPreviewSlots = useMemo(() => {
    if (!store) return [];
    const slots: (keyof typeof store.equippedAvatar)[] = ["hair", "top", "bottom", "accessory", "frame"];
    return slots.map((slot) => {
      const id = store.equippedAvatar[slot];
      return id ? (ITEMS_BY_ID[id] ?? null) : null;
    });
  }, [store?.equippedAvatar]);

  const roomPreviewItems = useMemo(() => {
    if (!store) return [];
    return (["wall", "floor", "furniture", "prop"] as const)
      .map((slot) => store.equippedRoom[slot])
      .filter(Boolean)
      .map((id) => ITEMS_BY_ID[id!])
      .filter(Boolean) as StoreItem[];
  }, [store?.equippedRoom]);

  const handlePurchase = (item: StoreItem) => {
    if (!store) return;
    if (item.price === 0 && item.slot) {
      if (item.category === "avatar") store.equipAvatar(item.slot as AvatarSlot, item.id);
      else store.equipRoom(item.slot as RoomSlot, item.id);
      return;
    }
    if (store.isOwned(item.id)) {
      setEquipItem(item);
      return;
    }
    if (!canAfford(item.price)) return;
    setConfirmItem(item);
  };

  const confirmPurchase = () => {
    if (!confirmItem || !store) return;
    const ok = store.purchaseItem(confirmItem.id, confirmItem.price);
    if (ok) {
      setConfirmItem(null);
      setEquipItem(confirmItem);
    }
  };

  const doEquip = (item: StoreItem) => {
    if (!store) return;
    if (item.category === "avatar" && item.slot) {
      store.equipAvatar(item.slot as AvatarSlot, item.id);
    }
    if (item.category === "room" && item.slot) {
      store.equipRoom(item.slot as RoomSlot, item.id);
    }
    setEquipItem(null);
  };

  const doUnequip = (item: StoreItem) => {
    if (!store) return;
    if (item.category === "avatar" && item.slot) {
      store.equipAvatar(item.slot as AvatarSlot, null);
    }
    if (item.category === "room" && item.slot) {
      store.equipRoom(item.slot as RoomSlot, null);
    }
    setEquipItem(null);
  };

  return (
    <section className="ws-storePage">
      <aside className="ws-storePreview">
        <div className="ws-storePreviewCard ws-storePreviewCharacter">
          <div className="ws-storePreviewTitle">My character</div>
          <div className="ws-storePreviewCharacterBody">
            {avatarPreviewSlots.every((x) => !x) ? (
              <span className="ws-storePreviewEmpty">No items equipped</span>
            ) : (
              avatarPreviewSlots.map((item, i) => (
                <span
                  key={item?.id ?? `slot-${i}`}
                  className={`ws-storePreviewCharacterPart ${item ? "" : "is-empty"}`}
                  title={item?.name}
                >
                  {item ? item.icon : "—"}
                </span>
              ))
            )}
          </div>
        </div>
        <div className="ws-storePreviewCard">
          <div className="ws-storePreviewTitle">My room</div>
          <div className="ws-storePreviewIcons">
            {roomPreviewItems.length === 0 ? (
              <span className="ws-storePreviewEmpty">No items equipped</span>
            ) : (
              roomPreviewItems.map((item) => (
                <span key={item.id} className="ws-storePreviewIcon" title={item.name}>
                  {item.icon}
                </span>
              ))
            )}
          </div>
        </div>
      </aside>

      <div className="ws-storeMain">
        <div className="ws-topbar" style={{ paddingLeft: 6, paddingRight: 6 }}>
          <div>
            <h1 className="ws-title">Store</h1>
            <div className="ws-sub">Spend points to customize your avatar and room.</div>
          </div>
          <div className="ws-storeBalance">
            <span className="ws-storeBalanceIcon">💎</span>
            <span className="ws-storeBalanceValue">{points.toLocaleString()} P</span>
          </div>
        </div>

        <div className="ws-storeTabs">
        <button
          type="button"
          className={`ws-storeTab ${tab === "avatar" ? "is-active" : ""}`}
          onClick={() => setTab("avatar")}
        >
          Avatar
        </button>
        <button
          type="button"
          className={`ws-storeTab ${tab === "room" ? "is-active" : ""}`}
          onClick={() => setTab("room")}
        >
          Room
        </button>
      </div>

      <div className="ws-storeGrid">
        {items.map((item) => {
          const owned = store?.isOwned(item.id) ?? item.price === 0;
          const equipped = store?.isEquipped(item.id, item.category) ?? false;
          const affordable = canAfford(item.price);

          return (
            <div
              key={item.id}
              className={`ws-storeCard ${item.rarity ?? "common"} ${equipped ? "is-equipped" : ""}`}
            >
              <div className="ws-storeCardIcon">{item.icon}</div>
              <div className="ws-storeCardName">{item.name}</div>
              <div className="ws-storeCardPrice">
                {item.price === 0 ? "Free" : `💎 ${item.price} P`}
              </div>
              <div className="ws-storeCardActions">
                {item.price > 0 && !owned && (
                  <button
                    type="button"
                    className="ws-btn ws-btn-sm ws-btn-primary"
                    disabled={!affordable}
                    onClick={() => handlePurchase(item)}
                  >
                    {affordable ? "Buy" : "Not enough P"}
                  </button>
                )}
                {owned && (
                  <>
                    {equipped ? (
                      <span className="ws-storeCardEquipped">Equipped</span>
                    ) : (
                      <button
                        type="button"
                        className="ws-btn ws-btn-sm ws-btn-outline"
                        onClick={() => setEquipItem(item)}
                      >
                        Equip
                      </button>
                    )}
                  </>
                )}
                {item.price === 0 && (
                  <button
                    type="button"
                    className="ws-btn ws-btn-sm ws-btn-outline"
                    onClick={() => handlePurchase(item)}
                  >
                    Use
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {isLowBalance && (
        <section className="ws-storeCta">
          <div className="ws-storeCtaTitle">Need more points?</div>
          <div className="ws-storeCtaSub">Practice to earn more and come back to the store.</div>
          <div className="ws-storeCtaActions">
            <button type="button" className="ws-btn ws-btn-primary" onClick={() => nav("/practice")}>
              Practice
            </button>
            <button type="button" className="ws-btn ws-btn-outline" onClick={() => nav("/")}>
              Home
            </button>
          </div>
        </section>
      )}
      </div>

      {confirmItem && (
        <div className="ws-storeOverlay" role="dialog" aria-modal="true" aria-labelledby="store-confirm-title">
          <div className="ws-storeModal">
            <h2 id="store-confirm-title" className="ws-storeModalTitle">Confirm purchase</h2>
            <div className="ws-storeModalBody">
              <span className="ws-storeModalIcon">{confirmItem.icon}</span>
              <span>{confirmItem.name}</span>
              <span className="ws-storeModalPrice">💎 {confirmItem.price} P</span>
            </div>
            <div className="ws-storeModalActions">
              <button type="button" className="ws-btn ws-btn-outline" onClick={() => setConfirmItem(null)}>
                Cancel
              </button>
              <button type="button" className="ws-btn ws-btn-primary" onClick={confirmPurchase}>
                Buy
              </button>
            </div>
          </div>
        </div>
      )}

      {equipItem && store && (
        <div className="ws-storeOverlay" role="dialog" aria-modal="true" aria-labelledby="store-equip-title">
          <div className="ws-storeModal">
            <h2 id="store-equip-title" className="ws-storeModalTitle">Equip item</h2>
            <div className="ws-storeModalBody">
              <span className="ws-storeModalIcon">{equipItem.icon}</span>
              <span>{equipItem.name}</span>
            </div>
            <div className="ws-storeModalActions">
              {store.isEquipped(equipItem.id, equipItem.category) ? (
                <button type="button" className="ws-btn ws-btn-outline" onClick={() => doUnequip(equipItem)}>
                  Unequip
                </button>
              ) : (
                <button type="button" className="ws-btn ws-btn-primary" onClick={() => doEquip(equipItem)}>
                  Equip
                </button>
              )}
              <button type="button" className="ws-btn ws-btn-outline" onClick={() => setEquipItem(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default function StoreView() {
  const store = useStoreOptional();
  if (!store) {
    return (
      <section className="ws-storePage">
        <div className="ws-storeHeader">
          <h1 className="ws-title">Store</h1>
          <div className="ws-sub">Store requires app context. Use StoreProvider in App.</div>
        </div>
      </section>
    );
  }
  return <StoreViewWithContext />;
}
