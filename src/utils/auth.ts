import { isSupabaseConfigured, supabase } from "@/lib/supabase";

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

export async function registerUser({
  name,
  email,
  password,
}: {
  name: string;
  email: string;
  password: string;
}) {
  if (isSupabaseConfigured && supabase) {
    const normalizedEmail = normalizeEmail(email);
    try {
      const { error } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: {
            name: name.trim(),
            role: "student",
          },
        },
      });

      if (error) {
        return {
          ok: false as const,
          message: translateSupabaseAuthError(error.message),
        };
      }

      return {
        ok: true as const,
      };
    } catch {
      return {
        ok: false as const,
        message: "No se pudo conectar con Supabase. Revisa tu conexion.",
      };
    }
  }

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

export async function loginUser({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  if (isSupabaseConfigured && supabase) {
    const normalizedEmail = normalizeEmail(email);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (error || !data.user) {
        return {
          ok: false as const,
          message: translateSupabaseAuthError(
            error?.message ?? "Invalid login credentials",
          ),
        };
      }

      const sessionUser: SessionUser = {
        id: data.user.id,
        name:
          typeof data.user.user_metadata.name === "string"
            ? data.user.user_metadata.name
            : normalizedEmail.split("@")[0],
        email: data.user.email ?? normalizedEmail,
        role: "student",
      };

      saveSession(sessionUser);

      return {
        ok: true as const,
        user: sessionUser,
      };
    } catch {
      return {
        ok: false as const,
        message: "No se pudo conectar con Supabase. Revisa tu conexion.",
      };
    }
  }

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

  if (isSupabaseConfigured && supabase) {
    void supabase.auth.signOut();
  }
}

export function isVisitorSession(user: SessionUser | null) {
  return user?.role === "visitor";
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

function translateSupabaseAuthError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (
    normalizedMessage.includes("already registered") ||
    normalizedMessage.includes("already been registered") ||
    normalizedMessage.includes("user already registered")
  ) {
    return "Ya existe una cuenta con ese correo.";
  }

  if (
    normalizedMessage.includes("signups not allowed") ||
    normalizedMessage.includes("signup disabled") ||
    normalizedMessage.includes("signups are disabled")
  ) {
    return "El registro de usuarios esta desactivado en Supabase. Activa los signups en Authentication.";
  }

  if (
    normalizedMessage.includes("email not confirmed") ||
    normalizedMessage.includes("not confirmed")
  ) {
    return "Tu correo aun no esta confirmado. Revisa tu email o desactiva la confirmacion en Supabase para pruebas.";
  }

  if (
    normalizedMessage.includes("invalid login credentials") ||
    normalizedMessage.includes("invalid credentials")
  ) {
    return "Correo o contrasena incorrectos.";
  }

  if (normalizedMessage.includes("password")) {
    return "La contrasena no cumple los requisitos minimos.";
  }

  return "No se pudo completar la operacion. Intentalo nuevamente.";
}
