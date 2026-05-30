import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { getSession, isVisitorSession } from "@/utils/auth";

const FAVORITES_KEY = "leo.favorites";

interface FavoriteRow {
  location_id: string;
}

export async function getFavoriteLocationIds() {
  const session = getSession();

  if (!isSupabaseConfigured || !supabase || isVisitorSession(session)) {
    return getLocalFavoriteLocationIds();
  }

  const { data, error } = await supabase
    .from("favorites")
    .select("location_id")
    .order("created_at", { ascending: true });

  if (error || !data) {
    return getLocalFavoriteLocationIds();
  }

  return data.map((favorite: FavoriteRow) => favorite.location_id);
}

export async function addFavoriteLocation(locationId: string) {
  const session = getSession();

  if (!isSupabaseConfigured || !supabase || isVisitorSession(session)) {
    saveLocalFavoriteLocationIds([...new Set([...getLocalFavoriteLocationIds(), locationId])]);
    return;
  }

  const { error } = await supabase.from("favorites").upsert(
    {
      user_id: session!.id,
      location_id: locationId,
    },
    { onConflict: "user_id,location_id" },
  );

  if (error) {
    saveLocalFavoriteLocationIds([...new Set([...getLocalFavoriteLocationIds(), locationId])]);
  }
}

export async function removeFavoriteLocation(locationId: string) {
  const session = getSession();

  if (!isSupabaseConfigured || !supabase || isVisitorSession(session)) {
    saveLocalFavoriteLocationIds(
      getLocalFavoriteLocationIds().filter((favoriteId) => favoriteId !== locationId),
    );
    return;
  }

  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("location_id", locationId);

  if (error) {
    saveLocalFavoriteLocationIds(
      getLocalFavoriteLocationIds().filter((favoriteId) => favoriteId !== locationId),
    );
  }
}

function getLocalFavoriteLocationIds() {
  if (typeof window === "undefined") {
    return [] as string[];
  }

  const rawFavorites = window.localStorage.getItem(FAVORITES_KEY);

  if (!rawFavorites) {
    return [] as string[];
  }

  try {
    return JSON.parse(rawFavorites) as string[];
  } catch {
    return [] as string[];
  }
}

function saveLocalFavoriteLocationIds(locationIds: string[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(locationIds));
}
