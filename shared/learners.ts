import type { Learner } from './types.js';

export const LEARNER_ROSTER: Learner[] = [
  { name: "Illona Addae",          email: "illona.addae@amalitech.com"       },
  { name: "Abraham Jimah Zorwi",   email: "abraham.zorwi@amalitech.com"      },
  { name: "Kofi Frimpong Osei",    email: "kofi.osei@amalitech.com"          },
  { name: "Emmanuel Joe Letsu",    email: "emmanuel.letsu@amalitech.com"     },
  { name: "Kwadjo Wusu-Ansah",     email: "kwadjo.wusu-ansah@amalitech.com"  },
  { name: "Broderick Nana Bentil", email: "broderick.bentil@amalitech.com"   },
  { name: "Jude Boachie",          email: "jude.boachie@amalitech.com"       },
];

export const ALLOWED_EMAILS = new Set<string>(LEARNER_ROSTER.map((l) => l.email));
