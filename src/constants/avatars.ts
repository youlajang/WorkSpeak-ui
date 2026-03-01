/** Profile avatar: custom photo URL (localStorage) or selected cat id */
export const AVATAR_URL_KEY = "ws_avatar_url";
export const AVATAR_CAT_ID_KEY = "ws_avatar_cat_id";

/** Dispatched when user saves profile avatar so rail can update */
export const AVATAR_CHANGED_EVENT = "ws-avatar-changed";

export type CatAvatar = {
  id: string;
  name: string;
  mark: string;
  isDefault?: boolean;
};

export const AVATARS: CatAvatar[] = [
  { id: "cat_1", name: "Cat 01", mark: "🐱", isDefault: true },
  { id: "cat_2", name: "Cat 02", mark: "😺" },
  { id: "cat_3", name: "Cat 03", mark: "😼" },
  { id: "cat_4", name: "Cat 04", mark: "😸" },
  { id: "cat_5", name: "Cat 05", mark: "🐈" },
  { id: "cat_6", name: "Cat 06", mark: "🐈‍⬛" },
  { id: "cat_7", name: "Cat 07", mark: "😻" },
  { id: "cat_8", name: "Cat 08", mark: "🙀" },
  { id: "cat_9", name: "Cat 09", mark: "😽" },
];

export function getCatMark(catId: string | null): string | null {
  if (!catId) return null;
  const a = AVATARS.find((x) => x.id === catId);
  return a ? a.mark : null;
}
