export const avatarOptions = {
  bodyColor: [
    { id: 'black', label: 'Schwarz', file: 'penguin_black.png', swatch: '#252525' },
    { id: 'blue', label: 'Blau', file: 'penguin_blue.png', swatch: '#2563eb' },
    { id: 'red', label: 'Rot', file: 'penguin_red.png', swatch: '#dc2626' },
    { id: 'green', label: 'Grün', file: 'penguin_green.png', swatch: '#16a34a' },
    { id: 'purple', label: 'Lila', file: 'penguin_purple.png', swatch: '#7c3aed' },
    { id: 'gray', label: 'Grau', file: 'penguin_gray.png', swatch: '#6b7280' },
    { id: 'brown', label: 'Braun', file: 'penguin_brown.png', swatch: '#92400e' },
    { id: 'pink', label: 'Rosa', file: 'penguin_pink.png', swatch: '#ec4899' },
    { id: 'yellow', label: 'Gelb', file: 'penguin_yellow.png', swatch: '#eab308' },
    { id: 'orange', label: 'Orange', file: 'penguin_orange.png', swatch: '#f97316' },
    { id: 'penguin_03_navy', label: 'Penguin 03 Navy', file: 'penguin_penguin_03_navy.png', swatch: '#888888' },
    { id: 'penguin_04_teal', label: 'Penguin 04 Teal', file: 'penguin_penguin_04_teal.png', swatch: '#888888' },
    { id: 'penguin_06_lime', label: 'Penguin 06 Lime', file: 'penguin_penguin_06_lime.png', swatch: '#888888' }
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

export function getOptionFile(group, id) {
  return avatarOptions[group]?.find(option => option.id === id)?.file || ''
}

export function getAvailableOptions(group, unlockedIds = []) {
  return (avatarOptions[group] || []).filter(option => option.unlocked || unlockedIds.includes(option.id) || group === 'bodyColor' || group === 'bellyColor')
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
