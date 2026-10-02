// Mirrors the backend (zod) rules so users get instant feedback

export function validateName(value) {
  if (value.trim().length < 20) return "Name must be at least 20 characters.";
  if (value.length > 60) return "Name must be 60 characters or fewer.";
  return "";
}

export function validateEmail(value) {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(value.trim()) ? "" : "Enter a valid email address.";
}

export function validateAddress(value) {
  if (!value.trim()) return "Address is required.";
  if (value.length > 400) return "Address must be 400 characters or fewer.";
  return "";
}

export function validatePassword(value) {
  if (value.length < 8 || value.length > 16) return "Password must be 8 to 16 characters.";
  if (!/[A-Z]/.test(value)) return "Include at least one uppercase letter.";
  if (!/[^A-Za-z0-9]/.test(value)) return "Include at least one special character.";
  return "";
}

export const roleLabels = {
  ADMIN: "Administrator",
  USER: "Customer",
  STORE_OWNER: "Store owner",
};
