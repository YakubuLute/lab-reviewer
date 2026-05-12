export function buildEmailHTML({
  learnerName,
  selectedLab,
  attempt,
  totalScore,
  maxScore,
  grade,
  passed,
  redoLab,
  plagiarism,
  strengths,
  improvements,
  otherRemarks,
  reviewerName,
  reviewDate,
  criteriaRows,
}) {
  const dateStr = new Date(reviewDate).toLocaleDateString("en-US", {
    month: "numeric",
    day: "numeric",
    year: "numeric",
  });
  const dateStrLong = new Date(reviewDate).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const ratingLabel = (raw) => {
    if (raw === 5) return "Excellent";
    if (raw === 4) return "Good";
    if (raw === 3) return "Average";
    if (raw === 2) return "Below Average";
    if (raw === 1) return "Poor";
    return "Not attempted";
  };

  const scoreColor = (raw) =>
    raw >= 4 ? "#16a34a" : raw >= 3 ? "#d97706" : "#dc2626";

  const sections = criteriaRows
    .map((c, i) => {
      const num = String(i + 1).padStart(2, "0");
      const color = scoreColor(c.rawScore);
      return `
    <div style="border:1px solid #e5e7eb;border-radius:12px;margin-bottom:14px;overflow:hidden;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;background:#f9fafb;border-bottom:1px solid #e5e7eb;">
        <div style="display:flex;align-items:center;gap:14px;">
          <div style="width:32px;height:32px;border-radius:50%;background:#4f46e5;color:#fff;font-size:12px;font-weight:800;text-align:center;line-height:32px;flex-shrink:0;">${num}</div>
          <div>
            <div style="font-size:15px;font-weight:700;color:#111827;">${c.criterion}</div>
            <div style="font-size:11px;color:#9ca3af;margin-top:2px;text-transform:uppercase;letter-spacing:0.06em;">Weight: ${c.effectiveWeight}%${attempt === "2nd" ? ` &nbsp;·&nbsp; Base: ${c.weight}%` : ""}</div>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;margin-left:12px;">
          <div style="font-size:22px;font-weight:900;color:${color};">${c.rawScore} <span style="font-size:14px;color:#9ca3af;font-weight:400;">/ 5</span></div>
          <div style="font-size:11px;font-weight:700;color:${color};margin-top:2px;">${ratingLabel(c.rawScore)}</div>
        </div>
      </div>
      ${
        c.feedback
          ? `<div style="padding:14px 20px;"><div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Reviewer Remarks</div><div style="font-size:13px;color:#374151;line-height:1.7;">${c.feedback}</div></div>`
          : `<div style="padding:14px 20px;font-size:13px;color:#d1d5db;font-style:italic;">No remarks recorded.</div>`
      }
    </div>`;
    })
    .join("");

  const progressPct = Math.min(
    (parseFloat(totalScore) / maxScore) * 100,
    100,
  ).toFixed(1);

  return `<!DOCTYPE html>
<html><body style="margin:0;padding:0;background:#f0f2f5;font-family:'Segoe UI',Arial,sans-serif;">
<div style="max-width:680px;margin:36px auto;border-radius:16px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.18);">

  <div style="background:#0b1f38;padding:44px 44px 36px;">
    <div style="font-size:10px;font-weight:600;letter-spacing:0.28em;text-transform:uppercase;color:rgba(255,255,255,0.35);margin-bottom:28px;">NSP &nbsp; Performance &nbsp; Review</div>
    <div style="font-size:14px;color:rgba(255,255,255,0.6);font-weight:400;margin-bottom:6px;">Results for</div>
    <div style="font-size:38px;font-weight:800;color:#ffffff;letter-spacing:-0.5px;line-height:1.1;margin-bottom:10px;">${learnerName}</div>
    <div style="font-size:15px;font-weight:600;color:#38bdf8;margin-bottom:36px;">${selectedLab}</div>
    <div style="display:flex;gap:12px;flex-wrap:wrap;">
      <div style="flex:1;min-width:140px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px 18px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:7px;">Reviewer</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;">${reviewerName}</div>
      </div>
      <div style="flex:1;min-width:140px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px 18px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:7px;">Date</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;">${dateStr}</div>
      </div>
      <div style="flex:1;min-width:100px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.1);border-radius:10px;padding:14px 18px;">
        <div style="font-size:9px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:7px;">Attempt</div>
        <div style="font-size:15px;font-weight:700;color:#ffffff;">${attempt}</div>
      </div>
    </div>
  </div>

  <div style="background:#f97316;padding:0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
      <tr>
        <td style="padding:28px 32px;vertical-align:middle;width:60%;">
          <div style="font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:rgba(255,255,255,0.75);margin-bottom:4px;">Overall &nbsp; Score</div>
          <div style="font-size:12px;color:rgba(255,255,255,0.65);margin-bottom:18px;">
            Σ (raw ÷ 5 × weight%) &nbsp;·&nbsp; Max: ${maxScore}%
            ${
              passed
                ? `&nbsp;·&nbsp;<span style="color:#fff;font-weight:700;">✅ PASSED</span>`
                : `&nbsp;·&nbsp;<span style="color:#fff;font-weight:700;">❌ NOT PASSED</span>`
            }
            ${redoLab ? `<br><span style="color:rgba(255,255,255,0.85);font-weight:600;">🔁 Re-do Required</span>` : ""}
            ${plagiarism ? `<br><span style="color:rgba(255,255,255,0.85);font-weight:600;">⚠️ Plagiarism Flagged</span>` : ""}
          </div>
          <div style="position:relative;height:6px;background:rgba(255,255,255,0.25);border-radius:999px;overflow:visible;">
            <div style="height:6px;width:${progressPct}%;background:#ffffff;border-radius:999px;position:relative;">
              <div style="position:absolute;right:-5px;top:-4px;width:14px;height:14px;border-radius:50%;background:#ffffff;box-shadow:0 0 0 3px rgba(255,255,255,0.35);"></div>
            </div>
          </div>
        </td>
        <td style="padding:28px 32px 28px 0;vertical-align:middle;text-align:right;width:40%;background:rgba(0,0,0,0.08);border-left:1px solid rgba(255,255,255,0.15);">
          <div style="display:inline-flex;align-items:baseline;gap:2px;">
            <span style="font-size:64px;font-weight:900;color:#ffffff;letter-spacing:-2px;line-height:1;">${totalScore}</span>
            <span style="font-size:20px;font-weight:600;color:rgba(255,255,255,0.8);align-self:flex-end;margin-bottom:8px;">%</span>
          </div>
          <div style="font-size:12px;font-weight:700;color:rgba(255,255,255,0.7);margin-top:4px;">${grade.label}</div>
        </td>
      </tr>
    </table>
  </div>

  <div style="background:#f0f2f5;padding:12px 0 0;">
    <div style="background:#ffffff;margin:0 0 8px;padding:32px 40px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;margin-bottom:22px;">Assessment Breakdown</div>
      ${sections}
    </div>

    ${
      strengths || improvements || otherRemarks
        ? `
    <div style="background:#ffffff;margin:0 0 8px;padding:32px 40px;">
      <div style="font-size:10px;font-weight:700;letter-spacing:0.22em;text-transform:uppercase;color:#9ca3af;margin-bottom:20px;">Overall Remarks</div>
      ${
        strengths
          ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
        <div style="font-size:10px;font-weight:700;color:#16a34a;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;">Strengths</div>
        <div style="font-size:13px;color:#374151;line-height:1.8;">${strengths}</div>
      </div>`
          : ""
      }
      ${
        improvements
          ? `
      <div style="background:#fef2f2;border:1px solid #fecaca;border-radius:12px;padding:18px 20px;margin-bottom:12px;">
        <div style="font-size:10px;font-weight:700;color:#dc2626;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;">Gaps</div>
        <div style="font-size:13px;color:#374151;line-height:1.8;">${improvements}</div>
      </div>`
          : ""
      }
      ${
        otherRemarks
          ? `
      <div style="background:#f5f3ff;border:1px solid #ddd6fe;border-radius:12px;padding:18px 20px;">
        <div style="font-size:10px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:0.14em;margin-bottom:8px;">Other Remarks</div>
        <div style="font-size:13px;color:#374151;line-height:1.8;">${otherRemarks}</div>
      </div>`
          : ""
      }
    </div>`
        : ""
    }

    <div style="background:#ffffff;padding:18px 40px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <div style="font-size:11px;color:#9ca3af;">Score formula: Σ (raw ÷ 5 × weight%)${attempt === "2nd" ? " · 2nd attempt max = 80%" : ""}</div>
      <div style="font-size:11px;color:#9ca3af;">AmaliTech · ${dateStrLong}</div>
    </div>
  </div>
</div>
</body></html>`;
}
