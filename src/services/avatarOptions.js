export const avatarOptions = {
  bodyColor: [
    { id: 'black', label: 'Schwarz', file: 'penguin_black.png', swatch: '#252525' }
  ],

  bellyColor: [
    { id: 'white', label: 'Weiß', file: 'penguin_belly_01_white.png', swatch: '#fffaf0' }
  ],

  headItem: [
    { id: 'none', label: 'Keine', file: 'none.svg', unlocked: true },
    { id: 'cap_black', label: 'Schwarz Mütze', file: 'head_cap_black.png', swatch: '#252525', unlocked: true },
    { id: 'cap_blue', label: 'Blau Mütze', file: 'head_cap_blue.png', swatch: '#2563eb', unlocked: true },
    { id: 'cap_navy', label: 'Navy Mütze', file: 'head_cap_navy.png', swatch: '#1e3a8a', unlocked: true },
    { id: 'cap_teal', label: 'Türkis Mütze', file: 'head_cap_teal.png', swatch: '#0f766e', unlocked: true },
    { id: 'cap_green', label: 'Grün Mütze', file: 'head_cap_green.png', swatch: '#16a34a', unlocked: true },
    { id: 'cap_lime', label: 'Lime Mütze', file: 'head_cap_lime.png', swatch: '#84cc16', unlocked: true },
    { id: 'cap_yellow', label: 'Gelb Mütze', file: 'head_cap_yellow.png', swatch: '#eab308', unlocked: true },
    { id: 'cap_orange', label: 'Orange Mütze', file: 'head_cap_orange.png', swatch: '#f97316', unlocked: true },
    { id: 'cap_red', label: 'Rot Mütze', file: 'head_cap_red.png', swatch: '#dc2626', unlocked: true },
    { id: 'cap_pink', label: 'Pink Mütze', file: 'head_cap_pink.png', swatch: '#ec4899', unlocked: true },
    { id: 'cap_purple', label: 'Lila Mütze', file: 'head_cap_purple.png', swatch: '#7c3aed', unlocked: true },
    { id: 'cap_brown', label: 'Braun Mütze', file: 'head_cap_brown.png', swatch: '#92400e', unlocked: true },
    { id: 'cap_gray', label: 'Grau Mütze', file: 'head_cap_gray.png', swatch: '#6b7280', unlocked: true }
  ],

  shortsItem: [
    { id: 'none', label: 'Keine', file: 'none.svg', unlocked: true },
    { id: 'black', label: 'Schwarz Shorts', file: 'shorts_black.png', swatch: '#252525', unlocked: true },
    { id: 'blue', label: 'Blau Shorts', file: 'shorts_blue.png', swatch: '#2563eb', unlocked: true },
    { id: 'navy', label: 'Navy Shorts', file: 'shorts_navy.png', swatch: '#1e3a8a', unlocked: true },
    { id: 'teal', label: 'Türkis Shorts', file: 'shorts_teal.png', swatch: '#0f766e', unlocked: true },
    { id: 'green', label: 'Grün Shorts', file: 'shorts_green.png', swatch: '#16a34a', unlocked: true },
    { id: 'lime', label: 'Lime Shorts', file: 'shorts_lime.png', swatch: '#84cc16', unlocked: true },
    { id: 'yellow', label: 'Gelb Shorts', file: 'shorts_yellow.png', swatch: '#eab308', unlocked: true },
    { id: 'orange', label: 'Orange Shorts', file: 'shorts_orange.png', swatch: '#f97316', unlocked: true },
    { id: 'red', label: 'Rot Shorts', file: 'shorts_red.png', swatch: '#dc2626', unlocked: true },
    { id: 'pink', label: 'Pink Shorts', file: 'shorts_pink.png', swatch: '#ec4899', unlocked: true },
    { id: 'purple', label: 'Lila Shorts', file: 'shorts_purple.png', swatch: '#7c3aed', unlocked: true },
    { id: 'brown', label: 'Braun Shorts', file: 'shorts_brown.png', swatch: '#92400e', unlocked: true },
    { id: 'gray', label: 'Grau Shorts', file: 'shorts_gray.png', swatch: '#6b7280', unlocked: true }
  ],

  accessoryItem: [
    { id: 'none', label: 'Keine', file: 'none.svg', unlocked: true },
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
  return (avatarOptions[group] || []).filter(option =>
    option.unlocked ||
    unlockedIds.includes(option.id) ||
    group === 'bodyColor' ||
    group === 'bellyColor'
  )
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
