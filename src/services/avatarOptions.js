export const avatarOptions = {
  bodyColor: [
    { id: 'black', label: 'Schwarz', swatch: '#252525' },
    { id: 'blue', label: 'Blau', swatch: '#2563eb' },
    { id: 'purple', label: 'Lila', swatch: '#7c3aed' },
    { id: 'gray', label: 'Grau', swatch: '#6b7280' }
  ],

  bellyColor: [
    { id: 'white', label: 'Weiß', swatch: '#fffaf0' },
    { id: 'cream', label: 'Creme', swatch: '#f7d99b' },
    { id: 'mint', label: 'Mint', swatch: '#bdf7d3' },
    { id: 'pink', label: 'Rosa', swatch: '#ffc9df' }
  ],

  headItem: [
    { id: 'none', label: 'Keine', file: 'none.svg', unlocked: true },
    { id: 'cap', label: 'Mütze', file: 'none.svg', unlocked: true }
  ],

  shortsItem: [
    { id: 'none', label: 'Keine', file: 'none.svg', unlocked: true },
    { id: 'shorts', label: 'Shorts', file: 'none.svg', unlocked: true },
    { id: 'skirt', label: 'Basketröckchen', file: 'none.svg', unlocked: true }
  ],

  accessoryItem: [
    { id: 'none', label: 'Keines', file: 'none.svg', icon: '—', unlocked: true },
    { id: 'crown', label: 'Krone', file: 'none.svg', icon: '👑', unlocked: false },
    { id: 'cape', label: 'Umhang', file: 'none.svg', icon: '🧣', unlocked: false }
  ]
}

export function getOptionLabel(group, id) {
  return avatarOptions[group]?.find(option => option.id === id)?.label || id || '-'
}

export function getAvailableOptions(group, unlockedIds = []) {
  return (avatarOptions[group] || []).filter(option => option.unlocked || unlockedIds.includes(option.id))
}

export function getNextOption(group, currentId, direction = 1, unlockedIds = []) {
  const available = getAvailableOptions(group, unlockedIds)

  if (available.length === 0) return currentId

  const currentIndex = Math.max(0, available.findIndex(option => option.id === currentId))
  const nextIndex = (currentIndex + direction + available.length) % available.length

  return available[nextIndex].id
}

export function isOptionUnlocked(option, unlockedIds = []) {
  return Boolean(option.unlocked || unlockedIds.includes(option.id))
}
