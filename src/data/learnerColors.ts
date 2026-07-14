const PALETTE: [string, string][] = [
  ['#FCE7D8', '#C2530B'],
  ['#E2ECFB', '#2A57C9'],
  ['#E3F4EB', '#15824E'],
  ['#EFE9FB', '#6B46C1'],
  ['#FBF0DA', '#9A6B0C'],
  ['#E6F2F2', '#0E7C7B'],
  ['#FBE6E6', '#C23838'],
];

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
  return h;
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0]! + parts[parts.length - 1]![0]!).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export function learnerColor(name: string): { bg: string; fg: string } {
  const [bg, fg] = PALETTE[nameHash(name) % PALETTE.length] as [string, string];
  return { bg, fg };
}
