import type { CodeFile } from '../../shared/types';
import { S } from '../styles/formStyles';

interface Props {
  codeSource: 'github' | 'paste';
  setCodeSource: (v: 'github' | 'paste') => void;
  repoUrl: string;
  setRepoUrl: (v: string) => void;
  branch: string;
  setBranch: (v: string) => void;
  pastedCode: string;
  setPastedCode: (v: string) => void;
  codeFiles: CodeFile[];
  fetchStatus: 'idle' | 'fetching' | 'done' | 'error';
  fetchError: string;
  truncatedNote: string;
  onFetchRepo: () => void;
}

export default function CodeInputCard({
  codeSource, setCodeSource, repoUrl, setRepoUrl, branch, setBranch,
  pastedCode, setPastedCode, codeFiles, fetchStatus, fetchError, truncatedNote, onFetchRepo,
}: Props) {
  const isFetching = fetchStatus === 'fetching';

  return (
    <div style={S.card}>
      <div style={S.cardHeader}>
        <span style={S.stepNum}>01</span>
        <span style={{ fontSize: 1.5, color: 'var(--line)', margin: '0 4px' }}>·</span>
        <span style={S.cardTitle}>Code Intake</span>
      </div>
      <div style={S.cardBody}>
        {/* Toggle */}
        <div style={{ display: 'flex', gap: 3, background: 'var(--line2)', borderRadius: 9, padding: 3, marginBottom: 14 }}>
          {(['github', 'paste'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCodeSource(mode)}
              style={{
                flex: 1, padding: '7px 0', borderRadius: 7, border: 'none', cursor: 'pointer',
                background: codeSource === mode ? '#fff' : 'transparent',
                color: codeSource === mode ? 'var(--ink)' : 'var(--ink3)',
                fontSize: 12.5, fontWeight: 600, fontFamily: 'var(--sans)', transition: 'all 0.15s',
                boxShadow: codeSource === mode ? '0 1px 3px rgba(20,24,29,.1)' : 'none',
              }}
            >
              {mode === 'github' ? 'Fetch from GitHub' : 'Paste Code'}
            </button>
          ))}
        </div>

        {codeSource === 'github' ? (
          <>
            <label style={S.label}>Repository URL</label>
            <input
              type="url"
              placeholder="https://github.com/owner/repo"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              style={{ ...S.input, marginBottom: 10 }}
            />
            <label style={S.label}>Branch (optional)</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                type="text"
                placeholder="main"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                style={{ ...S.input, marginBottom: 0 }}
              />
              <button
                onClick={onFetchRepo}
                disabled={!repoUrl.trim() || isFetching}
                style={{
                  padding: '10px 18px', borderRadius: 9, border: 'none', whiteSpace: 'nowrap',
                  background: repoUrl.trim() && !isFetching ? 'var(--orange)' : 'var(--line2)',
                  color: repoUrl.trim() && !isFetching ? '#fff' : 'var(--ink3)',
                  fontSize: 13, fontWeight: 600, cursor: repoUrl.trim() && !isFetching ? 'pointer' : 'not-allowed',
                  fontFamily: 'var(--sans)', transition: 'all 0.15s',
                }}
              >
                {isFetching ? 'Fetching…' : 'Fetch Code'}
              </button>
            </div>

            {fetchStatus === 'error' && (
              <div style={{ padding: '9px 12px', background: 'var(--red-t)', border: '1px solid rgba(217,67,74,.2)', borderRadius: 9, color: 'var(--red)', fontSize: 12, marginBottom: 8 }}>
                {fetchError}
              </div>
            )}

            {fetchStatus === 'done' && codeFiles.length > 0 && (
              <div style={{ padding: '10px 12px', background: 'var(--green-t)', border: '1px solid #C7EAD8', borderRadius: 9, marginBottom: truncatedNote ? 8 : 0 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-d)', marginBottom: 5 }}>
                  {codeFiles.length} file{codeFiles.length !== 1 ? 's' : ''} loaded
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3px 10px', maxHeight: 100, overflowY: 'auto' }}>
                  {codeFiles.map((f) => (
                    <span key={f.path} style={{ fontSize: 11, color: 'var(--green-d)', fontFamily: 'var(--mono)' }}>{f.path}</span>
                  ))}
                </div>
              </div>
            )}

            {truncatedNote && (
              <div style={{ padding: '8px 12px', background: 'var(--amber-t)', border: '1px solid rgba(217,138,11,.2)', borderRadius: 9, fontSize: 11, color: 'var(--amber)' }}>
                {truncatedNote}
              </div>
            )}
          </>
        ) : (
          <>
            <label style={S.label}>
              Paste code below. Separate files with{' '}
              <code style={{ fontFamily: 'var(--mono)', background: 'var(--line2)', padding: '1px 5px', borderRadius: 4, fontSize: 11 }}>// --- filename.js ---</code>{' '}
              comment lines.
            </label>
            <textarea
              rows={12}
              placeholder={'// --- server.js ---\nconst express = require(\'express\');\n...\n\n// --- routes/tasks.js ---\n...'}
              value={pastedCode}
              onChange={(e) => setPastedCode(e.target.value)}
              style={{ ...S.input, minHeight: 200, resize: 'vertical', lineHeight: 1.5, fontFamily: 'var(--mono)', fontSize: 12 }}
            />
            {pastedCode.trim() && (
              <div style={{ marginTop: 6, fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--mono)' }}>
                {pastedCode.trim().length.toLocaleString()} chars pasted
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
