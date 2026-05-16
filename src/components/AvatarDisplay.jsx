import { getAvatar } from '../data/avatars';

export default function AvatarDisplay({ value, size = 80, style = {} }) {
  if (value && value.startsWith('data:')) {
    return (
      <img
        src={value}
        alt="Profile"
        style={{
          width: size,
          height: size,
          borderRadius: '50%',
          objectFit: 'cover',
          flexShrink: 0,
          display: 'block',
          ...style,
        }}
      />
    );
  }
  const av = getAvatar(value);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: av.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: Math.round(size * 0.45),
        userSelect: 'none',
        flexShrink: 0,
        ...style,
      }}
    >
      {av.emoji}
    </div>
  );
}
