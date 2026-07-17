import { useState, useEffect } from 'react';
import {
  getRubrics, getRubric, createRubric, updateRubricApi, deleteRubricApi, cloneRubricApi,
  addRubricCriterion, updateRubricCriterion, deleteRubricCriterion,
  type RubricTemplate, type RubricCriterion,
} from '../lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type DetailRubric = RubricTemplate & { criteria: RubricCriterion[] };

// ── Editable criterion row ─────────────────────────────────────────────────────

interface CriterionRowProps {
  c: RubricCriterion;
  onSave: (id: string, name: string, description: string, weight: number) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

function CriterionRow({ c, onSave, onDelete }: CriterionRowProps) {
  const [name, setName] = useState(c.name);
  const [description, setDescription] = useState(c.description);
  const [weight, setWeight] = useState(String(c.weight));
  const [saving, setSaving] = useState(false);

  const isDirty = name !== c.name || description !== c.description || weight !== String(c.weight);

  const save = async () => {
    const w = parseInt(weight, 10);
    if (!name.trim() || isNaN(w) || w < 1 || w > 100) return;
    setSaving(true);
    try { await onSave(c.id, name.trim(), description.trim(), w); }
    finally { setSaving(false); }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 18px', borderBottom: '1px solid var(--line2)' }}>
      <div style={{ flex: '0 0 36px', paddingTop: 9, fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--ink3)' }}>
        {c.sortOrder + 1 < 10 ? '0' + (c.sortOrder + 1) : c.sortOrder + 1}
      </div>
      <div style={{ flex: '0 0 160px' }}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={isDirty ? save : undefined}
          style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 7, padding: '6px 9px', fontSize: 12, fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <input
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          onBlur={isDirty ? save : undefined}
          placeholder="Description…"
          style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 7, padding: '6px 9px', fontSize: 12, fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
        />
      </div>
      <div style={{ flex: '0 0 70px', display: 'flex', alignItems: 'center', gap: 4 }}>
        <input
          type="number"
          value={weight}
          min={1} max={100}
          onChange={(e) => setWeight(e.target.value)}
          onBlur={isDirty ? save : undefined}
          style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 7, padding: '6px 8px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink)', outline: 'none', textAlign: 'right', boxSizing: 'border-box' }}
        />
        <span style={{ fontSize: 11, color: 'var(--ink3)' }}>%</span>
      </div>
      <div style={{ flex: '0 0 60px', display: 'flex', alignItems: 'center', gap: 6, paddingTop: 2 }}>
        {saving && <span style={{ fontSize: 10, color: 'var(--ink3)' }}>…</span>}
        <button
          onClick={() => { if (window.confirm('Delete this criterion?')) void onDelete(c.id); }}
          title="Delete criterion"
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--ink3)', fontSize: 16, lineHeight: 1, padding: '4px 6px', borderRadius: 6 }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--red)'; (e.currentTarget as HTMLElement).style.background = 'var(--red-t)'; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--ink3)'; (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// ── Read-only criterion row ───────────────────────────────────────────────────

function ReadOnlyCriterionRow({ c, idx }: { c: RubricCriterion; idx: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 20px', borderBottom: '1px solid var(--line2)' }}>
      <span style={{ width: 26, flexShrink: 0, fontSize: 11, fontWeight: 600, fontFamily: 'var(--mono)', color: 'var(--ink3)', paddingTop: 1 }}>
        {String(idx + 1).padStart(2, '0')}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{c.name}</div>
      </div>
      <div style={{ flex: 2, minWidth: 0 }}>
        <div style={{ fontSize: 12, color: 'var(--ink2)', lineHeight: 1.5 }}>{c.description}</div>
      </div>
      <div style={{ width: 72, flexShrink: 0, textAlign: 'right' }}>
        <span style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{c.weight}%</span>
      </div>
    </div>
  );
}

// ── Main view ─────────────────────────────────────────────────────────────────

export default function RubricsView() {
  const [rubrics, setRubrics] = useState<(RubricTemplate & { criteriaCount: number })[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DetailRubric | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');

  // New criterion form
  const [addingCriterion, setAddingCriterion] = useState(false);
  const [newCName, setNewCName] = useState('');
  const [newCDesc, setNewCDesc] = useState('');
  const [newCWeight, setNewCWeight] = useState('');
  const [addingC, setAddingC] = useState(false);

  const [opError, setOpError] = useState('');

  // ── Load list ─────────────────────────────────────────────────────────────

  const loadRubrics = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getRubrics();
      setRubrics(data);
      // Auto-select first if nothing selected
      if (!selectedId && data.length > 0) setSelectedId(data[0]!.id);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadRubrics(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load detail when selection changes ────────────────────────────────────

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setDetailLoading(true);
    setIsEditing(false);
    setOpError('');
    getRubric(selectedId)
      .then((d) => setDetail(d))
      .catch((err) => setOpError((err as Error).message))
      .finally(() => setDetailLoading(false));
  }, [selectedId]);

  // ── Operations ────────────────────────────────────────────────────────────

  const handleNewRubric = async () => {
    setOpError('');
    try {
      const r = await createRubric('New Rubric', '');
      const withCount = { ...r, criteriaCount: 0 };
      setRubrics((prev) => [...prev, withCount]);
      setSelectedId(r.id);
      setDetail(r);
      setEditName(r.name);
      setEditDesc(r.description);
      setIsEditing(true);
    } catch (err) { setOpError((err as Error).message); }
  };

  const handleClone = async (id: string) => {
    setOpError('');
    try {
      const cloned = await cloneRubricApi(id);
      const withCount = { ...cloned, criteriaCount: cloned.criteria?.length ?? 0 };
      setRubrics((prev) => [...prev, withCount]);
      setSelectedId(cloned.id);
    } catch (err) { setOpError((err as Error).message); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this rubric? This cannot be undone.')) return;
    setOpError('');
    try {
      await deleteRubricApi(id);
      const remaining = rubrics.filter((r) => r.id !== id);
      setRubrics(remaining);
      if (selectedId === id) {
        const next = remaining.find((r) => r.ownerId !== null) ?? remaining[0] ?? null;
        setSelectedId(next?.id ?? null);
      }
    } catch (err) { setOpError((err as Error).message); }
  };

  const handleSaveEdit = async () => {
    if (!detail || !editName.trim()) return;
    setEditSaving(true);
    setEditError('');
    try {
      const updated = await updateRubricApi(detail.id, editName.trim(), editDesc.trim());
      setDetail((prev) => prev ? { ...prev, name: updated.name, description: updated.description } : prev);
      setRubrics((prev) => prev.map((r) => r.id === detail.id ? { ...r, name: updated.name, description: updated.description } : r));
      setIsEditing(false);
    } catch (err) {
      setEditError((err as Error).message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleAddCriterion = async () => {
    if (!detail || !newCName.trim()) return;
    const w = parseInt(newCWeight, 10);
    if (isNaN(w) || w < 1 || w > 100) return;
    setAddingC(true);
    setOpError('');
    try {
      const c = await addRubricCriterion(detail.id, { name: newCName.trim(), description: newCDesc.trim(), weight: w });
      setDetail((prev) => prev ? { ...prev, criteria: [...prev.criteria, c] } : prev);
      setRubrics((prev) => prev.map((r) => r.id === detail.id ? { ...r, criteriaCount: r.criteriaCount + 1 } : r));
      setNewCName(''); setNewCDesc(''); setNewCWeight('');
      setAddingCriterion(false);
    } catch (err) {
      setOpError((err as Error).message);
    } finally {
      setAddingC(false);
    }
  };

  const handleSaveCriterion = async (id: string, name: string, description: string, weight: number) => {
    if (!detail) return;
    const updated = await updateRubricCriterion(detail.id, id, { name, description, weight });
    setDetail((prev) => prev ? { ...prev, criteria: prev.criteria.map((c) => c.id === id ? updated : c) } : prev);
  };

  const handleDeleteCriterion = async (id: string) => {
    if (!detail) return;
    await deleteRubricCriterion(detail.id, id);
    setDetail((prev) => prev ? { ...prev, criteria: prev.criteria.filter((c) => c.id !== id) } : prev);
    setRubrics((prev) => prev.map((r) => r.id === detail.id ? { ...r, criteriaCount: Math.max(0, r.criteriaCount - 1) } : r));
  };

  // ── Derived ───────────────────────────────────────────────────────────────

  const systemRubrics = rubrics.filter((r) => r.ownerId === null);
  const myRubrics = rubrics.filter((r) => r.ownerId !== null);
  const totalWeight = detail?.criteria.reduce((s, c) => s + c.weight, 0) ?? 0;
  const weightOk = totalWeight === 100;
  const isOwn = detail ? detail.ownerId !== null : false;

  if (loading) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '60px 40px', textAlign: 'center', fontSize: 13, color: 'var(--ink3)' }}>
        Loading rubrics…
      </div>
    );
  }

  if (loadError) {
    return (
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ color: 'var(--red)', fontSize: 13 }}>Failed to load rubrics: {loadError}</div>
        <button onClick={() => void loadRubrics()} style={{ marginTop: 16, background: 'var(--orange)', color: '#fff', border: 'none', padding: '9px 18px', borderRadius: 9, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1180, margin: '0 auto', padding: '32px 40px 70px' }}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 20, marginBottom: 24, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.02em', margin: 0, color: 'var(--ink)' }}>Rubrics</h1>
          <p style={{ fontSize: 13.5, color: 'var(--ink2)', margin: '6px 0 0' }}>
            {systemRubrics.length} system templates · {myRubrics.length} custom
          </p>
        </div>
        <button
          onClick={() => void handleNewRubric()}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'var(--orange)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', boxShadow: '0 3px 10px rgba(242,107,33,.28)' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> New Rubric
        </button>
      </div>

      {opError && (
        <div style={{ marginBottom: 14, padding: '9px 14px', borderRadius: 8, background: 'var(--red-t)', color: 'var(--red)', fontSize: 12.5 }}>
          {opError}
        </div>
      )}

      {/* ── Two-column grid ─────────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 22, alignItems: 'start' }}>

        {/* LEFT · Rubric list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>

          {systemRubrics.length > 0 && (
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', padding: '4px 2px 2px' }}>
              SYSTEM TEMPLATES
            </div>
          )}
          {systemRubrics.map((r) => (
            <RubricListItem key={r.id} rubric={r} selected={r.id === selectedId} onClick={() => setSelectedId(r.id)} />
          ))}

          {myRubrics.length > 0 && (
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', padding: '12px 2px 2px' }}>
              MY RUBRICS
            </div>
          )}
          {myRubrics.map((r) => (
            <RubricListItem key={r.id} rubric={r} selected={r.id === selectedId} onClick={() => setSelectedId(r.id)} />
          ))}

          {rubrics.length === 0 && (
            <div style={{ fontSize: 13, color: 'var(--ink3)', textAlign: 'center', padding: '30px 10px' }}>No rubrics yet.</div>
          )}
        </div>

        {/* RIGHT · Detail */}
        {detailLoading ? (
          <div style={{ padding: '40px', textAlign: 'center', fontSize: 13, color: 'var(--ink3)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14 }}>
            Loading…
          </div>
        ) : detail ? (
          <div style={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14, boxShadow: 'var(--shadow)', overflow: 'hidden' }}>

            {/* Panel header */}
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--line2)' }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Rubric name"
                      style={{ flex: 1, minWidth: 200, border: '1px solid var(--line)', borderRadius: 8, padding: '8px 11px', fontSize: 15, fontWeight: 600, fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none' }}
                    />
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => void handleSaveEdit()}
                        disabled={editSaving || !editName.trim()}
                        style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', opacity: editSaving ? 0.6 : 1 }}
                      >
                        {editSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        onClick={() => { setIsEditing(false); setEditError(''); }}
                        style={{ background: 'var(--surface)', color: 'var(--ink2)', border: '1px solid var(--line)', padding: '8px 14px', borderRadius: 8, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                  <input
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Description (optional)"
                    style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 8, padding: '7px 11px', fontSize: 12.5, fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                  />
                  {editError && <div style={{ fontSize: 12, color: 'var(--red)' }}>{editError}</div>}
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--ink)' }}>{detail.name}</div>
                      {!isOwn && (
                        <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '.04em', color: 'var(--blue)', background: 'var(--blue-t)', padding: '2px 7px', borderRadius: 5 }}>
                          SYSTEM
                        </span>
                      )}
                    </div>
                    {detail.description && (
                      <div style={{ fontSize: 12, color: 'var(--ink2)', marginTop: 4, lineHeight: 1.5 }}>{detail.description}</div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    {isOwn && (
                      <>
                        <button
                          onClick={() => { setEditName(detail.name); setEditDesc(detail.description); setIsEditing(true); }}
                          style={{ background: 'var(--surface)', color: 'var(--ink2)', border: '1px solid var(--line)', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => void handleDelete(detail.id)}
                          style={{ background: 'transparent', color: 'var(--red)', border: '1px solid var(--red-t)', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => void handleClone(detail.id)}
                      style={{ background: 'var(--orange-t)', color: 'var(--orange-d)', border: '1px solid var(--orange-t2)', padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                    >
                      Clone
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Column headers */}
            {isOwn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 18px', borderBottom: '1px solid var(--line2)', background: '#FAFAFB' }}>
                <span style={{ flex: '0 0 36px', fontSize: 9.5, fontWeight: 700, color: 'var(--ink3)', fontFamily: 'var(--mono)' }}>#</span>
                <span style={{ flex: '0 0 160px', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)' }}>NAME</span>
                <span style={{ flex: 1, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)' }}>DESCRIPTION</span>
                <span style={{ flex: '0 0 70px', fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', textAlign: 'right' }}>WEIGHT</span>
                <span style={{ flex: '0 0 60px' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '9px 20px', borderBottom: '1px solid var(--line2)', background: '#FAFAFB' }}>
                <span style={{ width: 26, flexShrink: 0, fontSize: 9.5, fontWeight: 700, color: 'var(--ink3)', fontFamily: 'var(--mono)' }}>#</span>
                <span style={{ flex: 1, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)' }}>CRITERION</span>
                <span style={{ flex: 2, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)' }}>DESCRIPTION</span>
                <span style={{ width: 72, flexShrink: 0, fontSize: 9.5, fontWeight: 700, letterSpacing: '.06em', color: 'var(--ink3)', textAlign: 'right' }}>WEIGHT</span>
              </div>
            )}

            {/* Criteria rows */}
            {detail.criteria.length === 0 ? (
              <div style={{ padding: '28px 20px', textAlign: 'center', fontSize: 13, color: 'var(--ink3)' }}>
                {isOwn ? 'No criteria yet. Add your first criterion below.' : 'No criteria defined.'}
              </div>
            ) : isOwn ? (
              detail.criteria.map((c) => (
                <CriterionRow key={c.id} c={c} onSave={handleSaveCriterion} onDelete={handleDeleteCriterion} />
              ))
            ) : (
              detail.criteria.map((c, i) => (
                <ReadOnlyCriterionRow key={c.id} c={c} idx={i} />
              ))
            )}

            {/* Add criterion form (own rubrics only) */}
            {isOwn && (
              <>
                {addingCriterion ? (
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, padding: '12px 18px', borderBottom: '1px solid var(--line2)', background: '#FFFDFB', flexWrap: 'wrap' }}>
                    <div style={{ flex: '0 0 160px' }}>
                      <label style={{ fontSize: 10.5, color: 'var(--ink3)', display: 'block', marginBottom: 4 }}>Name</label>
                      <input
                        value={newCName} onChange={(e) => setNewCName(e.target.value)}
                        placeholder="e.g. Error Handling"
                        style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 9px', fontSize: 12, fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                        autoFocus
                      />
                    </div>
                    <div style={{ flex: 1, minWidth: 160 }}>
                      <label style={{ fontSize: 10.5, color: 'var(--ink3)', display: 'block', marginBottom: 4 }}>Description</label>
                      <input
                        value={newCDesc} onChange={(e) => setNewCDesc(e.target.value)}
                        placeholder="What does this criterion assess?"
                        style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 9px', fontSize: 12, fontFamily: 'var(--sans)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                    <div style={{ flex: '0 0 90px' }}>
                      <label style={{ fontSize: 10.5, color: 'var(--ink3)', display: 'block', marginBottom: 4 }}>Weight %</label>
                      <input
                        type="number" value={newCWeight} onChange={(e) => setNewCWeight(e.target.value)}
                        min={1} max={100} placeholder="15"
                        style={{ width: '100%', border: '1px solid var(--line)', borderRadius: 7, padding: '7px 9px', fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--ink)', outline: 'none', boxSizing: 'border-box' }}
                        onKeyDown={(e) => e.key === 'Enter' && void handleAddCriterion()}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button
                        onClick={() => void handleAddCriterion()}
                        disabled={addingC || !newCName.trim() || !newCWeight}
                        style={{ background: 'var(--orange)', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--sans)', opacity: addingC ? 0.6 : 1 }}
                      >
                        {addingC ? '…' : 'Add'}
                      </button>
                      <button
                        onClick={() => { setAddingCriterion(false); setNewCName(''); setNewCDesc(''); setNewCWeight(''); }}
                        style={{ background: 'transparent', border: 'none', color: 'var(--ink3)', fontSize: 12, cursor: 'pointer', padding: '8px 6px', fontFamily: 'var(--sans)' }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--line2)' }}>
                    <button
                      onClick={() => setAddingCriterion(true)}
                      style={{ background: 'transparent', border: '1px dashed var(--line)', color: 'var(--ink3)', padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--sans)' }}
                    >
                      + Add criterion
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 12, padding: '13px 20px', background: '#FAFAFB' }}>
              {!weightOk && detail.criteria.length > 0 && (
                <span style={{ fontSize: 11, color: 'var(--amber)', fontWeight: 600 }}>
                  Weights sum to {totalWeight}% (should be 100%)
                </span>
              )}
              <span style={{ fontSize: 12, fontWeight: 700, color: weightOk ? 'var(--green-d)' : 'var(--amber)' }}>
                Total: {totalWeight}%
              </span>
            </div>

          </div>
        ) : (
          <div style={{ padding: '60px', textAlign: 'center', fontSize: 13, color: 'var(--ink3)', background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 14 }}>
            Select a rubric to view details.
          </div>
        )}

      </div>
    </div>
  );
}

// ── List item ─────────────────────────────────────────────────────────────────

function RubricListItem({
  rubric, selected, onClick,
}: { rubric: RubricTemplate & { criteriaCount: number }; selected: boolean; onClick: () => void }) {
  const isSystem = rubric.ownerId === null;
  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? '#FFFDFB' : 'var(--surface)',
        border: `1px solid ${selected ? 'var(--orange)' : 'var(--line)'}`,
        borderRadius: 11, padding: '12px 14px', cursor: 'pointer',
        boxShadow: 'var(--shadow)', transition: 'border-color .12s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--ink)', flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {rubric.name}
        </span>
        {isSystem && (
          <span style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--blue)', background: 'var(--blue-t)', padding: '1px 6px', borderRadius: 4, flexShrink: 0, letterSpacing: '.03em' }}>
            SYS
          </span>
        )}
      </div>
      <div style={{ fontSize: 11, color: 'var(--ink3)', marginTop: 4 }}>
        {rubric.criteriaCount} criteri{rubric.criteriaCount === 1 ? 'on' : 'a'}
      </div>
    </div>
  );
}
