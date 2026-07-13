import type { Report } from '../../shared/types';
import { S } from '../styles/formStyles';

type SendStatus = 'idle' | 'sending' | 'done' | 'error';

interface Props {
  report: Report;
  copied: string;
  copy: (text: string, key: string) => void;
  reset: () => void;
  ccEmail: string;
  onCcEmailChange: (v: string) => void;
  onSendEmail: () => void;
  sendStatus: SendStatus;
  sendError: string;
}

export default function ReportOutput({ report, copied, copy, reset, ccEmail, onCcEmailChange, onSendEmail, sendStatus, sendError }: Props) {
  const openInBrowser = () => {
    const blob = new Blob([report.html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  };

  const handleDownloadPDF = () => {
    const tab = window.open('', '_blank');
    if (!tab) return;
    tab.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>${report.subject}</title><style>@media print{@page{size:A4;margin:0;}body{margin:0;}.no-print{display:none!important;}}</style></head><body>${report.html}<div class="no-print" style="position:fixed;bottom:28px;right:28px;z-index:9999;"><button onclick="window.print()" style="padding:12px 22px;background:#F26B21;color:#fff;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;font-family:'Segoe UI',Arial,sans-serif;">Save as PDF</button></div></body></html>`);
    tab.document.close();
  };

  const isSending = sendStatus === 'sending';
  const sendDone = sendStatus === 'done';

  return (
    <>
      {/* Action card */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--green-d)' }}>Report ready</span>
            <span style={{ fontFamily: 'var(--mono)', fontSize: 10, padding: '2px 8px', background: 'var(--green-t)', border: '1px solid #C7EAD8', borderRadius: 6, color: 'var(--green-d)' }}>
              {report.grade.label}
            </span>
          </div>
          <button
            onClick={reset}
            style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink3)', background: 'none', border: '1px solid var(--line)', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', fontFamily: 'var(--sans)' }}
          >
            ↩ New Review
          </button>
        </div>

        <div style={{ padding: '16px 18px' }}>
          {/* To / CC */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 14 }}>
            <div style={{ padding: '8px 12px', background: 'var(--line2)', border: '1px solid var(--line)', borderRadius: 9 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.07em' }}>To</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink)', fontWeight: 600 }}>{report.learnerEmail}</div>
            </div>
            <div style={{ padding: '8px 12px', background: 'var(--line2)', border: '1px solid var(--line)', borderRadius: 9 }}>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink3)', marginBottom: 3, textTransform: 'uppercase', letterSpacing: '.07em' }}>CC (optional)</div>
              <input
                type="email"
                value={ccEmail}
                onChange={(e) => onCcEmailChange(e.target.value)}
                placeholder="colleague@company.com"
                disabled={sendStatus === 'sending' || sendStatus === 'done'}
                style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', fontSize: 12.5, color: 'var(--ink)', fontWeight: 600, fontFamily: 'var(--sans)', padding: 0 }}
              />
            </div>
          </div>

          {/* Send button */}
          {sendDone ? (
            <div style={{ padding: '11px 14px', background: 'var(--green-t)', border: '1px solid #C7EAD8', borderRadius: 10, color: 'var(--green-d)', fontSize: 13, fontWeight: 700, textAlign: 'center', marginBottom: 12 }}>
              ✓ Email sent successfully
            </div>
          ) : (
            <button
              onClick={onSendEmail}
              disabled={isSending}
              style={{
                width: '100%', padding: '11px', borderRadius: 10, border: 'none', marginBottom: 8,
                background: isSending ? 'var(--line2)' : 'var(--green)',
                color: isSending ? 'var(--ink3)' : '#fff',
                fontSize: 13, fontWeight: 700, cursor: isSending ? 'not-allowed' : 'pointer',
                fontFamily: 'var(--sans)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.15s',
              }}
            >
              {isSending
                ? <><span style={{ display: 'inline-block', width: 12, height: 12, border: '2px solid rgba(255,255,255,.4)', borderTopColor: '#fff', borderRadius: '50%', animation: 'll-spin .8s linear infinite' }} />Sending…</>
                : 'Send Email'}
            </button>
          )}
          {sendStatus === 'error' && (
            <div style={{ padding: '8px 12px', background: 'var(--red-t)', border: '1px solid rgba(217,67,74,.2)', borderRadius: 9, color: 'var(--red)', fontSize: 12, marginBottom: 8 }}>{sendError}</div>
          )}
          {!sendDone && (
            <p style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 12 }}>
              Sends to {report.learnerEmail}{ccEmail.trim() ? ` and CC's ${ccEmail.trim()}` : ''}. Review all fields above before sending.
            </p>
          )}

          {/* Copy / download buttons */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {([
              { key: 'subject', label: 'Copy Subject',  value: report.subject      },
              { key: 'html',    label: 'Copy HTML',      value: report.html         },
              { key: 'excel',   label: 'Copy Excel Row', value: report.excelRow     },
              { key: 'lemail',  label: 'Copy To Email',  value: report.learnerEmail },
            ] as const).map(({ key, label, value }) => (
              <button key={key} onClick={() => copy(value, key)} style={S.copyBtn(copied, key)}>
                {copied === key ? 'Copied!' : label}
              </button>
            ))}
            <button
              onClick={handleDownloadPDF}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 14px', background: 'var(--ai-t)', border: '1px solid var(--ai-line)', borderRadius: 9, color: 'var(--ai-d)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', whiteSpace: 'nowrap' }}
            >
              Download PDF
            </button>
          </div>

          {/* Fallback textareas */}
          <div style={{ marginTop: 14, padding: '12px 14px', background: 'var(--line2)', border: '1px solid var(--line)', borderRadius: 10 }}>
            <div style={{ fontSize: 11, color: 'var(--ink3)', marginBottom: 10 }}>Click inside any field to auto-select, then Ctrl+C / Cmd+C to copy.</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {([
                { label: 'Subject Line',     value: report.subject,   rows: 1, resize: 'none' as const },
                { label: 'Excel Row',        value: report.excelRow,  rows: 2, resize: 'none' as const },
                ...(report.aiEmailBody ? [{ label: 'AI Email Body', value: report.aiEmailBody, rows: 7, resize: 'vertical' as const }] : []),
                { label: 'Email HTML',       value: report.html,      rows: 5, resize: 'vertical' as const },
              ]).map(({ label, value, rows, resize }) => (
                <div key={label}>
                  <div style={{ fontFamily: 'var(--mono)', fontSize: 9.5, color: 'var(--ink3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>{label}</div>
                  <textarea
                    readOnly
                    value={value}
                    rows={rows}
                    style={{ width: '100%', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, padding: '8px 12px', color: 'var(--ink2)', fontSize: 11, fontFamily: 'var(--mono)', resize, boxSizing: 'border-box', outline: 'none' }}
                    onFocus={(e) => e.target.select()}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Email preview */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden', marginBottom: 12 }}>
        <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--mono)', fontSize: 10.5, fontWeight: 700, color: 'var(--ink2)', textTransform: 'uppercase', letterSpacing: '.08em' }}>Email Preview</span>
          <button
            onClick={openInBrowser}
            style={{ padding: '6px 12px', background: 'var(--line2)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink2)', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
          >
            Open in Browser
          </button>
        </div>
        <div style={{ background: '#f8fafc' }}>
          <iframe srcDoc={report.html} style={{ width: '100%', height: 640, border: 'none', display: 'block' }} title="Email Preview" sandbox="allow-same-origin" />
        </div>
      </div>

      {/* Excel preview */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '16px 18px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 8 }}>Excel Row Preview</div>
        <div style={{ background: 'var(--line2)', borderRadius: 8, padding: '10px 12px', overflowX: 'auto' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10, color: 'var(--ink3)', marginBottom: 5, whiteSpace: 'nowrap' }}>
            DATE | LEARNER | REVIEWER | LAB | ATTEMPT | {report.criteriaRows.map((c) => c.criterion.split(' ')[0]).join(' | ')} | TOTAL | REDO | PLAGIARISM | STRENGTHS | GAPS | OTHER
          </div>
          <div style={{ fontFamily: 'var(--mono)', fontSize: 10.5, color: 'var(--ink2)', wordBreak: 'break-all', lineHeight: 1.8 }}>{report.excelRow}</div>
        </div>
      </div>

      {/* Sending guide */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', padding: '16px 18px', marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: 10, fontWeight: 700, color: 'var(--ink3)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 10 }}>How to Send Manually</div>
        <div style={{ fontSize: 12, color: 'var(--amber)', marginBottom: 12, padding: '8px 12px', background: 'var(--amber-t)', border: '1px solid rgba(217,138,11,.2)', borderRadius: 8 }}>
          Option A: &quot;Send Email&quot; above (needs SMTP in server/.env). Option B: Open in Browser → Copy → paste into Outlook.
        </div>
        {[
          'Click "Open in Browser" above',
          'Press Ctrl+A / Cmd+A to select all',
          'Press Ctrl+C / Cmd+C to copy',
          'Open Outlook and start a new email',
          'Paste into the email body',
          `Set To: ${report.learnerEmail}${ccEmail.trim() ? ` and CC: ${ccEmail.trim()}` : ''}`,
          'Paste the subject line and hit Send',
        ].map((text, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8, alignItems: 'flex-start' }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--orange-t)', border: '1px solid var(--orange-t2)', color: 'var(--orange-d)', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
            <div style={{ fontSize: 12.5, color: 'var(--ink2)', lineHeight: 1.5 }}>{text}</div>
          </div>
        ))}
      </div>
    </>
  );
}
