import { useState, useRef, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { AVATARS } from '../data/avatars';
import { useUser } from '../context/UserContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import AvatarDisplay from '../components/AvatarDisplay';

function compressImage(file, maxPx = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const ratio = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}

export default function Profile() {
  const { activeUser, getItem, setItem } = useUser();
  const { user } = useAuth();
  const [avatarVal, setAvatarVal] = useState(() => getItem('avatar') || 'fox');
  const [error, setError] = useState('');
  const [saved, setSaved]  = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (snap.exists() && snap.data().avatar) {
        const av = snap.data().avatar;
        setItem('avatar', av);
        setAvatarVal(av);
      }
    });
  }, [user?.uid]);

  async function syncAvatar(av) {
    if (!user) return;
    await setDoc(doc(db, 'users', user.uid), { avatar: av, profileName: activeUser }, { merge: true });
  }

  const isCustom = avatarVal.startsWith('data:');

  function selectBuiltin(id) {
    setItem('avatar', id);
    setAvatarVal(id);
    syncAvatar(id);
    flash();
  }

  async function handleFile(e) {
    setError('');
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file.'); return; }
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5 MB.'); return; }
    try {
      const dataUrl = await compressImage(file);
      setItem('avatar', dataUrl);
      setAvatarVal(dataUrl);
      syncAvatar(dataUrl);
      flash();
    } catch {
      setError('Could not process image — try a different file.');
    }
    e.target.value = '';
  }

  function removeCustom() {
    setItem('avatar', 'fox');
    setAvatarVal('fox');
    syncAvatar('fox');
    flash();
  }

  function flash() {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Profile</h1>
          <p className="page-sub">Customize your dashboard identity</p>
        </div>
        {saved && <span className="profile-saved-badge">✓ Saved</span>}
      </div>

      {/* Current avatar */}
      <div className="card profile-avatar-card">
        <div className="profile-avatar-center">
          <div className="profile-avatar-wrap" onClick={() => fileRef.current?.click()}>
            <AvatarDisplay value={avatarVal} size={120} />
            <div className="profile-avatar-overlay">
              <span>Upload photo</span>
            </div>
          </div>
          <div className="profile-avatar-meta">
            <span className="profile-username">{activeUser}</span>
            {isCustom && (
              <button className="profile-remove-photo" onClick={removeCustom}>
                Remove custom photo
              </button>
            )}
          </div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleFile}
        />
        {error && <p className="profile-error">{error}</p>}
      </div>

      {/* Built-in avatars */}
      <div className="card">
        <h2 className="card-title">Built-in avatars</h2>
        <div className="avatar-picker-grid">
          {AVATARS.map(av => {
            const selected = !isCustom && avatarVal === av.id;
            return (
              <button
                key={av.id}
                className={`avatar-picker-option${selected ? ' selected' : ''}`}
                onClick={() => selectBuiltin(av.id)}
                title={av.label}
              >
                <div
                  className="avatar-picker-circle"
                  style={{ background: av.bg }}
                >
                  {av.emoji}
                </div>
                <span className="avatar-picker-label">{av.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upload photo */}
      <div className="card">
        <h2 className="card-title">Upload your own photo</h2>
        <p className="profile-upload-hint">
          JPG, PNG, or GIF · max 5 MB · resized to 256 × 256 automatically
        </p>
        <div
          className="profile-upload-zone"
          onClick={() => fileRef.current?.click()}
          onDragOver={e => e.preventDefault()}
          onDrop={e => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file) handleFile({ target: { files: [file], value: '' } });
          }}
        >
          <span className="profile-upload-icon">📷</span>
          <span className="profile-upload-text">Click or drag an image here</span>
          <span className="profile-upload-sub">Your photo will be saved locally in your browser</span>
        </div>
      </div>
    </div>
  );
}
