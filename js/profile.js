// Profil pengguna sederhana: masuk hanya dengan nama panggilan.
// Nama disimpan di perangkat ini saja (localStorage), tidak dikirim ke mana pun,
// dan tidak ikut diekspor ke CSV penelitian (ekspor memakai kode siswa anonim).
import { load, resetAll, updateProfile } from './storage.js';

export const NAME_MIN = 2;
export const NAME_MAX = 30;
// Huruf (termasuk huruf beraksen), boleh spasi, titik, tanda petik, atau tanda hubung di tengah.
const NAME_PATTERN = /^\p{L}[\p{L}\p{M} .'’-]*$/u;

/** Merapikan spasi: "  budi   santoso " → "budi santoso" */
export function normalizeName(raw) {
  return String(raw ?? '').replace(/\s+/g, ' ').trim();
}

/** @returns {{ ok: true, name: string } | { ok: false, error: string }} */
export function validateName(raw) {
  const name = normalizeName(raw);
  if (!name) return { ok: false, error: 'Nama belum diisi.' };
  if ([...name].length < NAME_MIN) return { ok: false, error: `Nama minimal ${NAME_MIN} huruf.` };
  if ([...name].length > NAME_MAX) return { ok: false, error: `Nama maksimal ${NAME_MAX} huruf.` };
  if (!NAME_PATTERN.test(name)) {
    return { ok: false, error: 'Gunakan huruf saja (boleh spasi, titik, atau tanda petik).' };
  }
  return { ok: true, name };
}

export function isSignedIn(state = load()) {
  return Boolean(normalizeName(state.profile?.nickname));
}

export function currentName(state = load()) {
  return normalizeName(state.profile?.nickname);
}

/** Masuk atau mengubah nama. @returns hasil validasi */
export function signIn(raw) {
  const result = validateName(raw);
  if (!result.ok) return result;
  const firstTime = !isSignedIn();
  updateProfile({
    nickname: result.name,
    ...(firstTime ? { signedInAt: new Date().toISOString() } : {}),
  });
  return result;
}

/** Keluar = menghapus profil DAN progres di perangkat ini (tidak ada akun di server). */
export function signOut() {
  resetAll();
}
