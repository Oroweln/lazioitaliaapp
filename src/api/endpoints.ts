import { api, upload, type UploadFile } from '@/api/client';
import type {
  B2bRequest,
  Business,
  BusinessUpdate,
  Connections,
  ConnectionStatus,
  ConversationSummary,
  CreatedInvite,
  InviteSummary,
  LoginResponse,
  Me,
  Message,
  MyBusiness,
  Profile,
  RegisterBody,
  TokenPair,
  TotpInit,
} from '@/api/types';

export const Auth = {
  login: (email: string, password: string) =>
    api<LoginResponse>('/auth/login', { method: 'POST', body: { email, password }, auth: false }),
  verifyTotp: (pending_token: string, code: string) =>
    api<TokenPair>('/auth/totp', { method: 'POST', body: { pending_token, code }, auth: false }),
  register: (body: RegisterBody) =>
    api<{ message: string }>('/auth/register', { method: 'POST', body, auth: false }),
  logout: (refresh_token: string) =>
    api<void>('/auth/logout', { method: 'POST', body: { refresh_token }, auth: false }),
  // Both always answer 204, whether or not the address exists.
  resendVerification: (email: string) =>
    api<void>('/auth/resend-verification', { method: 'POST', body: { email }, auth: false }),
  forgotPassword: (email: string) =>
    api<void>('/auth/forgot-password', { method: 'POST', body: { email }, auth: false }),
};

export const Account = {
  me: () => api<Me>('/profile'),
  updateName: (name: string | null) => api<Profile>('/profile', { method: 'PUT', body: { name } }),
  delete: () => api<void>('/account', { method: 'DELETE' }),
  totpStatus: () => api<{ totp_enabled: boolean }>('/profile/totp'),
  totpInit: () => api<TotpInit>('/profile/totp/init', { method: 'POST' }),
  totpConfirm: (code: string) => api<void>('/profile/totp/confirm', { method: 'POST', body: { code } }),
  totpDisable: (password: string) =>
    api<void>('/profile/totp/disable', { method: 'POST', body: { password } }),
};

export const Company = {
  get: () => api<MyBusiness>('/business'),
  update: (body: BusinessUpdate) => api<Business>('/business', { method: 'PUT', body }),
  invites: () => api<InviteSummary[]>('/business/invites'),
  createInvite: (role: 'member' | 'admin') =>
    api<CreatedInvite>('/business/invites', { method: 'POST', body: { role } }),
  revokeInvite: (id: number) => api<void>(`/business/invites/${id}`, { method: 'DELETE' }),
  uploadLogo: (file: UploadFile) => upload<Business>('/business/logo', file),
  deleteLogo: () => api<Business>('/business/logo', { method: 'DELETE' }),
};

export const Discover = {
  list: (q: { search?: string; industry?: string; limit?: number; offset?: number }) =>
    api<Business[]>('/discover', { query: q }),
  get: (id: number) => api<Business>(`/discover/${id}`),
};

export const ConnectionsApi = {
  list: (q: { status?: ConnectionStatus; limit?: number; offset?: number } = {}) =>
    api<Connections>('/connections', { query: q }),
  send: (business_id: number, message?: string) =>
    api<B2bRequest>('/connections', { method: 'POST', body: { business_id, message: message || undefined } }),
  respond: (id: number, status: 'approved' | 'rejected') =>
    api<B2bRequest>(`/connections/${id}`, { method: 'PATCH', body: { status } }),
};

export const Chat = {
  conversations: (q: { limit?: number; offset?: number } = {}) =>
    api<ConversationSummary[]>('/chat', { query: q }),
  open: (other_user_id: number) =>
    api<{ conversation_id: number }>('/chat', { method: 'POST', body: { other_user_id } }),
  messages: (id: number, q: { before?: number; limit?: number } = {}) =>
    api<Message[]>(`/chat/${id}`, { query: q }),
  send: (id: number, content: string) => api<Message>(`/chat/${id}`, { method: 'POST', body: { content } }),
  markRead: (id: number, last_message_id: number) =>
    api<void>(`/chat/${id}/read`, { method: 'POST', body: { last_message_id } }),
};
