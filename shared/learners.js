/**
 * Hardcoded learner roster. Used server-side to validate email recipients.
 * The frontend reads from VITE_LEARNER_* env vars; this file is for the backend.
 */

export const LEARNER_ROSTER = [
  { name: "Illona Addae", email: "illona.addae@amalitech.com" },
  { name: "Abraham Jimah Zorwi", email: "abraham.zorwi@amalitech.com" },
  { name: "Kofi Frimpong Osei", email: "kofi.osei@amalitech.com" },
  { name: "Emmanuel Joe Letsu", email: "emmanuel.letsu@amalitech.com" },
  { name: "Kwadjo Wusu-Ansah", email: "kwadjo.wusu-ansah@amalitech.com" },
  { name: "Broderick Nana Bentil", email: "broderick.bentil@amalitech.com" },
  { name: "Jude Boachie", email: "jude.boachie@amalitech.com" },
];

export const ALLOWED_EMAILS = new Set(LEARNER_ROSTER.map((l) => l.email));
