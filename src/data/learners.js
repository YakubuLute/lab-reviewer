const _learnerNames = (import.meta.env.VITE_LEARNER_NAMES || "").split(",");
const _learnerEmails = (import.meta.env.VITE_LEARNER_EMAILS || "").split(",");

export const LEARNERS = _learnerNames.map((name, i) => ({
  name: name.trim(),
  email: _learnerEmails[i]?.trim() || "",
}));

export const EMMANUEL_EMAIL = import.meta.env.VITE_CC_EMAIL || "";
