import { useState } from 'react';
import { AVATARS, getAvatar } from '../data/avatars';
import { useUser } from '../context/UserContext';

const USERS = [
  { id: 'ken',   displayName: 'Ken'   },
  { id: 'shoan', displayName: 'Shoan' },
];

function AvatarCircle({ avatarId, size = 80 }) {
  const av = getAvatar(avatarId);
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
      }}
    >
      {av.emoji}
    </div>
  );
}

function AvatarPickerModal({ onSelect, onClose }) {
  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={e => e.stopPropagation()}>
        <h3 className="picker-title">Choose your avatar</h3>
        <div className="picker-grid">
          {AVATARS.map(av => (
            <button
              key={av.id}
              className="picker-option"
              onClick={() => onSelect(av.id)}
              title={av.label}
            >
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: av.bg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 28,
                }}
              >
                {av.emoji}
              </div>
              <span className="picker-option-label">{av.label}</span>
            </button>
          ))}
        </div>
        <button className="picker-cancel" onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}

export default function ProfilePicker() {
  const { switchUser } = useUser();
  const [pickingAvatarFor, setPickingAvatarFor] = useState(null);

  function getStoredAvatar(userId) {
    return localStorage.getItem(`${userId}_avatar`) || null;
  }

  function handleCardClick(user) {
    if (!getStoredAvatar(user.id)) {
      setPickingAvatarFor(user.id);
    } else {
      switchUser(user.id);
    }
  }

  function handleAvatarSelect(avatarId) {
    localStorage.setItem(`${pickingAvatarFor}_avatar`, avatarId);
    const userId = pickingAvatarFor;
    setPickingAvatarFor(null);
    switchUser(userId);
  }

  return (
    <div className="profile-picker-screen">
      <h1 className="profile-picker-title">Who's watching?</h1>
      <div className="profile-cards">
        {USERS.map(user => {
          const avatarId = getStoredAvatar(user.id) || 'fox';
          return (
            <button
              key={user.id}
              className="profile-card"
              onClick={() => handleCardClick(user)}
            >
              <div className="profile-avatar-ring">
                <AvatarCircle avatarId={avatarId} size={96} />
              </div>
              <span className="profile-card-name">{user.displayName}</span>
            </button>
          );
        })}
      </div>
      {pickingAvatarFor && (
        <AvatarPickerModal
          onSelect={handleAvatarSelect}
          onClose={() => setPickingAvatarFor(null)}
        />
      )}
    </div>
  );
}
