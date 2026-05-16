const COLORS = [
  '#3B82F6', '#8B5CF6', '#06B6D4', '#F59E0B', '#10B981',
  '#EF4444', '#F97316', '#EC4899', '#14B8A6', '#84CC16',
  '#A78BFA', '#FB923C',
];

export function classColor(name) {
  if (!name) return '#9CA3AF';
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return COLORS[Math.abs(h) % COLORS.length];
}
