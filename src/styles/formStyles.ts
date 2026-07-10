import type { CSSProperties } from 'react';

export const S = {
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 14,
    boxShadow: 'var(--shadow)',
    marginBottom: 12,
    overflow: 'hidden',
  } as CSSProperties,

  cardHeader: {
    padding: '15px 20px',
    borderBottom: '1px solid var(--line2)',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  } as CSSProperties,

  cardBody: {
    padding: '18px 20px 20px',
  } as CSSProperties,

  stepNum: {
    fontFamily: 'var(--mono)',
    fontSize: 13,
    fontWeight: 700,
    color: 'var(--orange)',
  } as CSSProperties,

  cardTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--ink)',
  } as CSSProperties,

  label: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--ink3)',
    textTransform: 'uppercase' as const,
    letterSpacing: '.07em',
    marginBottom: 5,
    display: 'block',
  } as CSSProperties,

  input: {
    width: '100%',
    background: 'var(--surface)',
    border: '1px solid var(--line)',
    borderRadius: 9,
    padding: '10px 12px',
    color: 'var(--ink)',
    fontSize: 13,
    fontFamily: 'var(--sans)',
    transition: 'border-color 0.15s',
    boxSizing: 'border-box' as const,
  } as CSSProperties,

  copyBtn: (copied: string, key: string): CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 14px',
    background: copied === key ? 'var(--green-t)' : 'var(--line2)',
    border: `1px solid ${copied === key ? '#C7EAD8' : 'var(--line)'}`,
    borderRadius: 9,
    color: copied === key ? 'var(--green-d)' : 'var(--ink2)',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'var(--sans)',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  }),
};
