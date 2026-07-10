export const LEARNER_COLORS: Record<string, { bg: string; fg: string }> = {
  'Illona Addae':          { bg: '#FCE7D8', fg: '#C2530B' },
  'Abraham Jimah Zorwi':   { bg: '#E2ECFB', fg: '#2A57C9' },
  'Kofi Frimpong Osei':    { bg: '#E3F4EB', fg: '#15824E' },
  'Emmanuel Joe Letsu':    { bg: '#EFE9FB', fg: '#6B46C1' },
  'Kwadjo Wusu-Ansah':     { bg: '#FBF0DA', fg: '#9A6B0C' },
  'Broderick Nana Bentil': { bg: '#FBE6E6', fg: '#C23838' },
  'Jude Boachie':          { bg: '#E6F2F2', fg: '#0E7C7B' },
};

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function learnerColor(name: string) {
  return LEARNER_COLORS[name] ?? { bg: '#F0F2F5', fg: '#576070' };
}
