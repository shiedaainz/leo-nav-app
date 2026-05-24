export interface LocalUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: "student" | "visitor";
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: "student" | "visitor";
}

const USERS_KEY = "leo.users";
const SESSION_KEY = "leo.session";

export function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(email);
  const users = getUsers();

  if (users.some((user) => user.email === normalizedEmail)) {
    return {
      ok: false as const,
      message: "Ya existe una cuenta con ese correo.",
    };
  }

  const user: LocalUser = {
    id: crypto.randomUUID(),
    name: name.trim(),
    email: normalizedEmail,
    password,
    role: "student",
  };

  saveUsers([...users, user]);

  return {
    ok: true as const,
  };
}

export function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = normalizeEmail(email);
  const user = getUsers().find(
    (candidate) =>
      candidate.email === normalizedEmail && candidate.password === password,
  );

  if (!user) {
    return {
      ok: false as const,
      message: "Correo o contrasena incorrectos.",
    };
  }

  const sessionUser = toSessionUser(user);
  saveSession(sessionUser);

  return {
    ok: true as const,
    user: sessionUser,
  };
}

export function loginAsVisitor() {
  const visitor: SessionUser = {
    id: "visitor",
    name: "Visitante",
    email: "visitante@leo.local",
    role: "visitor",
  };

  saveSession(visitor);
  return visitor;
}

export function getSession() {
  if (typeof window === "undefined") {
    return null;
  }

  const rawSession = window.localStorage.getItem(SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as SessionUser;
  } catch {
    return null;
  }
}

export function logout() {
  window.localStorage.removeItem(SESSION_KEY);
}

function getUsers() {
  if (typeof window === "undefined") {
    return [] as LocalUser[];
  }

  const rawUsers = window.localStorage.getItem(USERS_KEY);

  if (!rawUsers) {
    return [] as LocalUser[];
  }

  try {
    return JSON.parse(rawUsers) as LocalUser[];
  } catch {
    return [] as LocalUser[];
  }
}

function saveUsers(users: LocalUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function saveSession(user: SessionUser) {
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function toSessionUser(user: LocalUser): SessionUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}
