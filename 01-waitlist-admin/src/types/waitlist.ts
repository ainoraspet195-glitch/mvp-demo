export interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  referred_by: string | null;
  created_at: string;
}

export type WaitlistApiStatus = "ok" | "already_joined";

export interface WaitlistApiResponse {
  status: WaitlistApiStatus;
}
