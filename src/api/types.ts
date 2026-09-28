// Mirrors b2bserver response/request shapes exactly (snake_case, integer ids, RFC 3339 timestamps).

export type AccountStatus = 'pending' | 'approved' | 'suspended';
export type BusinessRole = 'owner' | 'admin' | 'member';
export type BusinessSize = 'solo' | 'small' | 'medium' | 'large';
export type ConnectionStatus = 'pending_admin' | 'approved' | 'rejected';

export type TokenPair = {
  access_token: string;
  refresh_token: string;
  user_id: number;
  role: string;
  status: AccountStatus;
};

export type LoginResponse = {
  requires_totp: boolean;
  pending_token?: string;
  access_token?: string;
  refresh_token?: string;
  user_id?: number;
  role?: string;
  status?: AccountStatus;
};

export type RegisterBody = {
  email: string;
  password: string;
  name: string;
  industry?: string;
  location?: string;
  full_name?: string;
  invite_token?: string;
};

export type Profile = { id: number; name: string | null; created_at: string };

export type Business = {
  id: number;
  name: string;
  industry: string | null;
  description: string | null;
  size: BusinessSize | null;
  location: string | null;
  looking_for: string | null;
  website: string | null;
  logo_url: string | null;
  approved: boolean;
  created_at: string;
};

export type Me = {
  user_id: number;
  email: string;
  role: string;
  status: AccountStatus;
  /// Informational only — the server gates nothing on it.
  email_verified: boolean;
  profile: Profile;
  business: Business | null;
  business_role: BusinessRole | null;
};

export type Member = { user_id: number; name: string | null; email: string; role: BusinessRole };

export type MyBusiness = { business: Business; role: BusinessRole; members: Member[] };

export type BusinessUpdate = Partial<{
  name: string | null;
  industry: string | null;
  description: string | null;
  size: BusinessSize | null;
  location: string | null;
  looking_for: string | null;
  website: string | null;
}>;

export type InviteSummary = { id: number; role: 'member' | 'admin'; expires_at: string; created_at: string };
export type CreatedInvite = { id: number; token: string; role: 'member' | 'admin'; expires_at: string };

export type B2bRequest = {
  id: number;
  requester_business_id: number;
  target_business_id: number;
  status: ConnectionStatus;
  message: string | null;
  created_at: string;
};

export type SentConnection = {
  id: number;
  business_id: number;
  business_owner_id: number | null;
  business_name: string;
  business_industry: string | null;
  business_location: string | null;
  business_logo_url: string | null;
  status: ConnectionStatus;
  message: string | null;
  created_at: string;
};

export type ReceivedConnection = {
  id: number;
  requester_business_id: number;
  requester_id: number | null;
  requester_name: string | null;
  requester_industry: string | null;
  requester_location: string | null;
  requester_logo_url: string | null;
  status: ConnectionStatus;
  message: string | null;
  created_at: string;
};

export type Connections = { sent: SentConnection[]; received: ReceivedConnection[] };

export type ConversationSummary = {
  id: number;
  other_user_id: number;
  other_name: string | null;
  other_business_name: string | null;
  other_business_logo_url: string | null;
  last_message: string | null;
  last_message_at: string | null;
  unread_count: number;
};

export type Message = { id: number; sender_id: number; content: string; created_at: string };

export type TotpInit = { secret: string; otpauth_url: string };
