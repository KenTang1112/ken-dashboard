export const AVATARS = [
  { id: 'fox',       emoji: '🦊', bg: '#FF6B35', label: 'Fox'       },
  { id: 'cat',       emoji: '🐱', bg: '#7B68EE', label: 'Cat'       },
  { id: 'bear',      emoji: '🐻', bg: '#A0522D', label: 'Bear'      },
  { id: 'penguin',   emoji: '🐧', bg: '#1E90FF', label: 'Penguin'   },
  { id: 'panda',     emoji: '🐼', bg: '#6B7280', label: 'Panda'     },
  { id: 'dragon',    emoji: '🐉', bg: '#EF4444', label: 'Dragon'    },
  { id: 'robot',     emoji: '🤖', bg: '#14B8A6', label: 'Robot'     },
  { id: 'ninja',     emoji: '🥷', bg: '#374151', label: 'Ninja'     },
  { id: 'wizard',    emoji: '🧙', bg: '#7C3AED', label: 'Wizard'    },
  { id: 'astronaut', emoji: '🧑‍🚀', bg: '#3B82F6', label: 'Astronaut' },
];

export function getAvatar(id) {
  return AVATARS.find(a => a.id === id) ?? AVATARS[0];
}
