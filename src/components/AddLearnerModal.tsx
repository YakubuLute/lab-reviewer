import { useState, useRef, useCallback } from 'react';

interface Props {
  cohortName: string;
  cohortTrack: string;
  onAdd: (name: string, email?: string) => Promise<void>;
  onBulkAdd: (csv: string) => Promise<number>;
  onClose: () => void;
}

type Tab = 'manual' | 'upload';

interface ParsedRow { name: string; email: string; }

function parseCsvPreview(text: string): { rows: ParsedRow[]; error: string | null } {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return { rows: [], error: 'File appears to be empty.' };

  const sep = (lines[0] ?? '').includes(';') ? ';' : ',';
  const firstCells = (lines[0] ?? '').toLowerCase().split(sep).map((c) => c.replace(/^["']|["']$/g, '').trim());
  const hasHeader = firstCells.some((c) => c === 'name' || c === 'email' || c === 'full name');
  const dataLines = hasHeader ? lines.slice(1) : lines;
  const nameIdx  = hasHeader ? firstCells.findIndex((c) => c.includes('name'))  : 0;
  const emailIdx = hasHeader ? firstCells.findIndex((c) => c.includes('email')) : 1;

  if (dataLines.length === 0) return { rows: [], error: 'No data rows found after the header.' };

  const rows = dataLines
    .map((line) => {
      const parts = line.split(sep).map((p) => p.trim().replace(/^["']|["']$/g, ''));
      const name  = parts[nameIdx >= 0 ? nameIdx : 0]?.trim() ?? '';
      const email = (emailIdx >= 0 ? parts[emailIdx]?.trim() : '') ?? '';
      return { name, email };
    })
    .filter((r) => r.name.length > 0);

  if (rows.length === 0) return { rows: [], error: 'No valid rows found. Make sure the file has a "name" column.' };
  return { rows, error: null };
}

export default function AddLearnerModal({ cohortName, cohortTrack, onAdd, onBulkAdd, onClose }: Props) {
  const [tab, setTab] = useState<Tab>('manual');

  // Manual tab state
  const [name, setName]   = useState('');
  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  // Upload tab state
  const [csvText, setCsvText]         = useState('');
  const [fileName, setFileName]       = useState('');
  const [preview, setPreview]         = useState<ParsedRow[]>([]);
  const [parseError, setParseError]   = useState('');
  const [dragging, setDragging]       = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [uploadDone, setUploadDone]   = useState(0);
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Handlers: manual ────────────────────────────────────────────────────────

  async function handleAddManual() {
    const n = name.trim();
    if (!n) return;
    setAdding(true);
    setAddError('');
    try {
      await onAdd(n, email.trim() || undefined);
      onClose();
    } catch (err) {
      setAddError((err as Error).message);
    } finally {
      setAdding(false);
    }
  }

  // ── Handlers: upload ────────────────────────────────────────────────────────

  const handleFile = useCallback((file: File) => {
    setUploadDone(0);
    setUploadError('');
    if (!file.name.match(/\.(csv|txt)$/i)) {
      setParseError('Please upload a CSV file (.csv or .txt).');
      setCsvText(''); setPreview([]); setFileName('');
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = (e.target?.result as string) ?? '';
      setCsvText(text);
      const { rows, error } = parseCsvPreview(text);
      setPreview(rows);
      setParseError(error ?? '');
    };
    reader.readAsText(file);
  }, []);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  async function handleUpload() {
    if (!csvText || preview.length === 0) return;
    setUploading(true);
    setUploadError('');
    try {
      const added = await onBulkAdd(csvText);
      setUploadDone(added);
      setTimeout(onClose, 1400);
    } catch (err) {
      setUploadError((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  // ── Styles ─────────────────────────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%', boxSizing: 'border-box',
    border: '1px solid var(--line)', borderRadius: 12,
    padding: '13px 16px', fontSize: 14, fontFamily: 'var(--sans)',
    color: 'var(--ink)', outline: 'none', background: '#fff',
    transition: 'border-color .15s, background .15s',
  };
  const focusInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--orange)';
    e.currentTarget.style.background  = '#FFFAF6';
  };
  const blurInput = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--line)';
    e.currentTarget.style.background  = '#fff';
  };

  const isManualValid = name.trim().length > 0;
  const canUpload     = preview.length > 0 && !parseError;

  return (
    // Overlay
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(15,20,30,.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}
    >
      {/* Card */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 548, boxShadow: '0 24px 64px rgba(0,0,0,.22)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{ padding: '26px 28px 22px', position: 'relative' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--ink)', letterSpacing: '-.02em' }}>Add learner</div>
          <div style={{ fontSize: 13.5, color: 'var(--ink3)', marginTop: 4 }}>
            to {cohortName} — {cohortTrack.split(' · ')[0]}
          </div>
          <button
            onClick={onClose}
            style={{ position: 'absolute', top: 22, right: 22, background: 'none', border: 'none', fontSize: 20, color: 'var(--ink3)', cursor: 'pointer', lineHeight: 1, padding: 4, borderRadius: 8 }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '0 28px 28px', flex: 1, overflowY: 'auto' }}>

          {/* Tab toggle */}
          <div style={{ display: 'inline-flex', background: '#F0F2F5', borderRadius: 12, padding: 4, marginBottom: 24, gap: 2 }}>
            {(['manual', 'upload'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                style={{
                  background: tab === t ? '#fff' : 'transparent',
                  border: 'none',
                  borderRadius: 9,
                  padding: '9px 20px',
                  fontSize: 13.5,
                  fontWeight: tab === t ? 600 : 500,
                  color: tab === t ? 'var(--ink)' : 'var(--ink3)',
                  cursor: 'pointer',
                  fontFamily: 'var(--sans)',
                  boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,.10)' : 'none',
                  transition: 'all .15s',
                }}
              >
                {t === 'manual' ? 'Add manually' : 'Upload sheet'}
              </button>
            ))}
          </div>

          {/* ── Manual tab ── */}
          {tab === 'manual' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 8 }}>
                  Full name
                </label>
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && isManualValid && handleAddManual()}
                  placeholder="Ama Akosua"
                  style={inputStyle}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink2)', display: 'block', marginBottom: 8 }}>
                  Email
                </label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && isManualValid && handleAddManual()}
                  placeholder="you@example.com"
                  type="email"
                  style={{ ...inputStyle, background: email ? '#FFFAF6' : '#F7F8FA', borderColor: email ? 'var(--orange)' : 'var(--line)' }}
                  onFocus={focusInput}
                  onBlur={blurInput}
                />
                <div style={{ fontSize: 12, color: 'var(--ink3)', marginTop: 7 }}>
                  Leave blank to auto-generate from the name.
                </div>
              </div>
              {addError && (
                <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-t)', borderRadius: 8, padding: '9px 12px' }}>
                  {addError}
                </div>
              )}
            </div>
          )}

          {/* ── Upload tab ── */}
          {tab === 'upload' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--orange)' : 'var(--line)'}`,
                  borderRadius: 14, padding: '32px 20px', textAlign: 'center',
                  cursor: 'pointer', background: dragging ? '#FFFAF6' : '#FAFAFB',
                  transition: 'border-color .15s, background .15s',
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.txt"
                  style={{ display: 'none' }}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                />
                <div style={{ fontSize: 22, marginBottom: 8, color: 'var(--ink3)' }}>⬆</div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', marginBottom: 4 }}>
                  {fileName ? fileName : 'Drop CSV here or click to browse'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink3)' }}>
                  Columns: <code style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>name</code> and optionally{' '}
                  <code style={{ fontFamily: 'var(--mono)', fontSize: 11 }}>email</code>
                </div>
              </div>

              {/* Parse error */}
              {parseError && (
                <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-t)', borderRadius: 8, padding: '9px 12px' }}>
                  {parseError}
                </div>
              )}

              {/* Preview table */}
              {preview.length > 0 && !parseError && (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink2)' }}>Preview</span>
                    <span style={{ fontSize: 11, color: 'var(--ink3)', fontFamily: 'var(--mono)' }}>
                      {preview.length} learner{preview.length === 1 ? '' : 's'}
                    </span>
                  </div>
                  <div style={{ maxHeight: 180, overflowY: 'auto' }}>
                    {preview.slice(0, 20).map((row, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, padding: '8px 14px', borderBottom: '1px solid var(--line2)', alignItems: 'center' }}>
                        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', flex: 1 }}>{row.name}</span>
                        <span style={{ fontSize: 11.5, color: 'var(--ink3)', fontFamily: 'var(--mono)', flex: 1 }}>
                          {row.email || <span style={{ color: 'var(--ink3)', fontStyle: 'italic' }}>auto-generated</span>}
                        </span>
                      </div>
                    ))}
                    {preview.length > 20 && (
                      <div style={{ padding: '8px 14px', fontSize: 11, color: 'var(--ink3)', textAlign: 'center' }}>
                        + {preview.length - 20} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Upload success */}
              {uploadDone > 0 && (
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--green-d)', background: 'var(--green-t)', borderRadius: 9, padding: '11px 14px', textAlign: 'center' }}>
                  ✓ {uploadDone} learner{uploadDone === 1 ? '' : 's'} added successfully
                </div>
              )}

              {/* Upload error */}
              {uploadError && (
                <div style={{ fontSize: 12, color: 'var(--red)', background: 'var(--red-t)', borderRadius: 8, padding: '9px 12px' }}>
                  {uploadError}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '18px 28px', borderTop: '1px solid var(--line2)', display: 'flex', justifyContent: 'flex-end', gap: 10, background: '#fff' }}>
          <button
            onClick={onClose}
            style={{ background: '#fff', border: '1px solid var(--line)', color: 'var(--ink)', padding: '11px 24px', borderRadius: 12, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
          >
            Cancel
          </button>

          {tab === 'manual' ? (
            <button
              onClick={handleAddManual}
              disabled={!isManualValid || adding}
              style={{
                background: isManualValid ? 'var(--orange)' : 'var(--line2)',
                color: isManualValid ? '#fff' : 'var(--ink3)',
                border: 'none', padding: '11px 24px', borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: isManualValid ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--sans)', boxShadow: isManualValid ? '0 3px 10px rgba(242,107,33,.28)' : 'none',
                transition: 'background .15s',
              }}
            >
              {adding ? 'Adding…' : 'Add learner'}
            </button>
          ) : (
            <button
              onClick={handleUpload}
              disabled={!canUpload || uploading || uploadDone > 0}
              style={{
                background: canUpload && !uploading && !uploadDone ? 'var(--orange)' : 'var(--line2)',
                color: canUpload && !uploading && !uploadDone ? '#fff' : 'var(--ink3)',
                border: 'none', padding: '11px 24px', borderRadius: 12,
                fontSize: 14, fontWeight: 600, cursor: canUpload && !uploading ? 'pointer' : 'not-allowed',
                fontFamily: 'var(--sans)',
                boxShadow: canUpload && !uploading ? '0 3px 10px rgba(242,107,33,.28)' : 'none',
                transition: 'background .15s',
              }}
            >
              {uploading
                ? 'Uploading…'
                : uploadDone > 0
                  ? `✓ ${uploadDone} added`
                  : preview.length > 0
                    ? `Upload ${preview.length} learner${preview.length === 1 ? '' : 's'}`
                    : 'Upload learners'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
