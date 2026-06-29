import type { Report } from '../../shared/types';
import { EMMANUEL_EMAIL } from '../data/learners';
import { S } from '../styles/formStyles';

type SendStatus = 'idle' | 'sending' | 'done' | 'error';

interface Props {
  report: Report;
  copied: string;
  copy: (text: string, key: string) => void;
  reset: () => void;
  onSendEmail: () => void;
  sendStatus: SendStatus;
  sendError: string;
}

export default function ReportOutput({ report, copied, copy, reset, onSendEmail, sendStatus, sendError }: Props) {
  const openInBrowser = () => {
    const blob = new Blob([report.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleDownloadPDF = () => {
    const tab = window.open('', '_blank');
    if (!tab) return;
    tab.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${report.subject}</title><style>@media print{@page{size:A4;margin:0;}body{margin:0;}.no-print{display:none!important;}}</style></head><body>${report.html}<div class="no-print" style="position:fixed;bottom:28px;right:28px;z-index:9999;"><button onclick="window.print()" style="padding:12px 22px;background:#4f46e5;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Segoe UI',Arial,sans-serif;">Save as PDF</button></div></body></html>`);
    tab.document.close();
  };

  const isSending = sendStatus === 'sending';
  const sendDone = sendStatus === 'done';

  return (
    <>
      {/* Action bar */}
      <div style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#22c55e', marginBottom: 4 }}>Report ready</div>

        {/* To / CC */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
          {([{ label: 'To', value: report.learnerEmail, color: '#c7d2fe' }, { label: 'CC', value: EMMANUEL_EMAIL, color: '#818cf8' }] as const).map(({ label, value, color }) => (
            <div key={label} style={{ padding: '8px 12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8 }}>
              <div style={{ fontSize: 10, color: '#475569', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
              <div style={{ fontSize: 13, color, fontWeight: 600 }}>{value}</div>
            </div>
          ))}
        </div>

        {/* Send Email button */}
        <div style={{ marginBottom: 14 }}>
          {sendDone ? (
            <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, color: '#22c55e', fontSize: 14, fontWeight: 700, textAlign: 'center' }}>
              Email sent successfully
            </div>
          ) : (
            <button onClick={onSendEmail} disabled={isSending} style={{ width: '100%', padding: '12px', borderRadius: 10, border: 'none', background: isSending ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg,#16a34a,#15803d)', color: isSending ? '#334155' : '#fff', fontSize: 14, fontWeight: 700, cursor: isSending ? 'not-allowed' : 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s' }}>
              {isSending
                ? <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,0.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />Sending...</>
                : 'Send Email'}
            </button>
          )}
          {sendStatus === 'error' && <div style={{ marginTop: 8, padding: '8px 12px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: 8, color: '#fca5a5', fontSize: 12 }}>{sendError}</div>}
          {!sendDone && <p style={{ fontSize: 11, color: '#334155', marginTop: 6, textAlign: 'center' }}>Sends to {report.learnerEmail} and CC&apos;s {EMMANUEL_EMAIL}. Review all fields above before sending.</p>}
        </div>

        {/* Copy / download buttons */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {([
            { key: 'subject', label: 'Copy Subject',   value: report.subject        },
            { key: 'html',    label: 'Copy HTML',       value: report.html           },
            { key: 'excel',   label: 'Copy Excel Row',  value: report.excelRow       },
            { key: 'lemail',  label: 'Copy To Email',   value: report.learnerEmail   },
          ] as const).map(({ key, label, value }) => (
            <button key={key} onClick={() => copy(value, key)} style={S.copyBtn(copied, key)}>
              {copied === key ? 'Copied!' : label}
            </button>
          ))}
          <button onClick={handleDownloadPDF} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'rgba(79,70,229,0.15)', border: '1px solid rgba(79,70,229,0.35)', borderRadius: 8, color: '#a5b4fc', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
            Download PDF
          </button>
          <button onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px', background: 'transparent', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#475569', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginLeft: 'auto' }}>
            New Review
          </button>
        </div>

        {/* Fallback text areas */}
        <div style={{ marginTop: 16, padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 10 }}>
          <div style={{ fontSize: 11, color: '#475569', marginBottom: 12 }}>Click inside any field to auto-select, then Ctrl+C / Cmd+C to copy.</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {([
              { label: 'Subject Line',     value: report.subject,     rows: 1,  color: '#c7d2fe', fontSize: 12, resize: 'none'     as const },
              { label: 'Excel Row',        value: report.excelRow,    rows: 2,  color: '#94a3b8', fontSize: 11, resize: 'none'     as const },
              ...(report.aiEmailBody ? [{ label: 'AI Plain-Text Email Body', value: report.aiEmailBody, rows: 8, color: '#c4b5fd', fontSize: 12, resize: 'vertical' as const }] : []),
              { label: 'Email HTML',       value: report.html,        rows: 5,  color: '#64748b', fontSize: 11, resize: 'vertical' as const },
            ]).map(({ label, value, rows, color, fontSize, resize }) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: '#4f46e5', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                <textarea readOnly value={value} rows={rows} style={{ width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '8px 12px', color, fontSize, outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace', resize }} onFocus={(e) => e.target.select()} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Excel preview */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, padding: '20px 24px', marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '.1em' }}>Excel Row Preview</div>
          <div style={{ fontSize: 11, color: '#475569' }}>Tab-separated</div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '12px 14px' }}>
          <div style={{ fontSize: 10, color: '#4f46e5', marginBottom: 6, letterSpacing: '0.05em', fontFamily: 'monospace', whiteSpace: 'nowrap', overflowX: 'auto' }}>
            DATE | LEARNER | REVIEWER | LAB | ATTEMPT | {report.criteriaRows.map((c) => c.criterion.split(' ')[0]).join(' | ')} | TOTAL | REDO | PLAGIARISM | STRENGTHS | GAPS | OTHER
          </div>
          <div style={{ fontSize: 11, color: '#94a3b8', fontFamily: 'monospace', wordBreak: 'break-all', lineHeight: 1.8, overflowX: 'auto', whiteSpace: 'nowrap' }}>{report.excelRow}</div>
        </div>
      </div>

      {/* Email preview */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ padding: '16px 24px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#4f46e5', textTransform: 'uppercase', letterSpacing: '.1em' }}>Email Preview</div>
          <button onClick={openInBrowser} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: '#818cf8', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
            Open in Browser
          </button>
        </div>
        <div style={{ background: '#f8fafc' }}>
          <iframe srcDoc={report.html} style={{ width: '100%', height: 640, border: 'none', display: 'block' }} title="Email Preview" sandbox="allow-same-origin" />
        </div>
      </div>

      {/* Sending guide */}
      <div style={{ background: 'rgba(79,70,229,0.06)', border: '1px solid rgba(79,70,229,0.15)', borderRadius: 14, padding: '20px 24px', marginBottom: 24 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: 10 }}>How to Send (Manual)</div>
        <div style={{ fontSize: 12, color: '#f59e0b', marginBottom: 14, padding: '8px 12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8 }}>
          Option A: Click &quot;Send Email&quot; above (requires SMTP config in server/.env). Option B: Use &quot;Open in Browser&quot; and paste into Outlook manually.
        </div>
        {['Click Open in Browser above', 'Press Ctrl+A / Cmd+A to select all', 'Press Ctrl+C / Cmd+C to copy', 'Open Outlook and start a new email', 'Paste into the email body', `Set To: ${report.learnerEmail} and CC: ${EMMANUEL_EMAIL}`, 'Paste the subject line and hit Send'].map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'rgba(99,102,241,0.3)', color: '#818cf8', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>{text}</div>
          </div>
        ))}
      </div>
    </>
  );
}
