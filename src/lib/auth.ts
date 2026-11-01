// Officer session for the BalSaathi portal: the API token (read by api.ts) plus the signed-in user's display info.

import { AUTH_TOKEN_KEY } from "./api";

export const USER_KEY = "balsaathi_user";

// Roles allowed into the portal, with the label shown in the dashboard header.
export const OFFICIAL_ROLE_LABELS: Record<string, string> = {
  admin: "Administrator",
  dpo: "District Programme Officer (जिल्हा कार्यक्रम अधिकारी)",
  bdo: "Block Development Officer (गट विकास अधिकारी)",
  cdpo: "Child Development Project Officer (बाल विकास प्रकल्प अधिकारी)",
  sarpanch: "Sarpanch (सरपंच)",
};

export interface LoginRole {
  id: number;
  code: string;
  name: string;
}

// `data` of POST /auth/login
export interface LoginResponse {
  id: string;
  mobileNumber: string;
  token: string;
  firstName: string | null;
  middleName: string | null;
  lastName: string | null;
  roles: LoginRole[];
}

export interface Officer {
  id: string;
  name: string;
  mobileNumber: string;
  role: string;
  roleLabel: string;
  loginTime: string;
}

// First portal role the user holds, or null when they have none (e.g. parent / sevika only).
export function getOfficialRole(roles: LoginRole[]): LoginRole | null {
  return roles.find((r) => r.code in OFFICIAL_ROLE_LABELS) ?? null;
}

export function saveSession(login: LoginResponse, role: LoginRole): Officer {
  const officer: Officer = {
    id: login.id,
    name: [login.firstName, login.middleName, login.lastName].filter(Boolean).join(" ") || login.mobileNumber,
    mobileNumber: login.mobileNumber,
    role: role.name,
    roleLabel: OFFICIAL_ROLE_LABELS[role.code],
    loginTime: new Date().toISOString(),
  };
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, login.token);
    localStorage.setItem(USER_KEY, JSON.stringify(officer));
  } catch {
    // Storage blocked (private mode etc.) — the session simply won't persist.
  }
  return officer;
}

// The signed-in officer, or null when there is no token or saved user.
export function getSession(): Officer | null {
  try {
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const user = localStorage.getItem(USER_KEY);
    return token && user ? (JSON.parse(user) as Officer) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  } catch {
    // Nothing to clear.
  }
}
