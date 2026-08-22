const AVATAR_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#F97316', '#84CC16', '#6B7280'];

export function avatarColor(name: string): string {
  return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];
}

export const INDUSTRY_COLORS: Record<string, string> = {
  IT: '#3B82F6',
  Manufacturing: '#F59E0B',
  Logistics: '#10B981',
  Marketing: '#EC4899',
  Finance: '#8B5CF6',
  Legal: '#6B7280',
  Agriculture: '#84CC16',
  Design: '#F43F5E',
  Healthcare: '#06B6D4',
  Tourism: '#F97316',
};
