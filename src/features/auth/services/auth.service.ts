import { apiClient } from "../../../shared/api/apiClient";

export type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
  };
} | null;

export async function getSession(): Promise<AuthSession> {
  const { data } = await apiClient.get<AuthSession>("/auth/get-session");
  return data;
}

export async function signIn(email: string, password: string): Promise<void> {
  await apiClient.post("/auth/sign-in/email", { email, password });
}

export async function signOut(): Promise<void> {
  await apiClient.post("/auth/sign-out");
}
