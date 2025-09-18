import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "lsat_arcade_profile_v1";

export type Profile = {
  xp: number;
  level: number;
  streak: number;
  lives: number;
  coins: number;
  lastPlayed: string | null;
};

const DEFAULT: Profile = { xp: 0, level: 1, streak: 0, lives: 5, coins: 0, lastPlayed: null };

export async function loadProfile(): Promise<Profile> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULT;
    const p = JSON.parse(raw);
    return { ...DEFAULT, ...p };
  } catch {
    return DEFAULT;
  }
}

export async function saveProfile(p: Profile) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}
