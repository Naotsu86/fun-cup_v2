export const avatarOptions = {
  bodyColor: [
    { id: 'black', label: 'Schwarz' },
    { id: 'blue', label: 'Blau' },
    { id: 'purple', label: 'Lila' },
    { id: 'gray', label: 'Grau' }
  ],

  bellyColor: [
    { id: 'white', label: 'Weiß' },
    { id: 'cream', label: 'Creme' },
    { id: 'mint', label: 'Mint' },
    { id: 'pink', label: 'Rosa' }
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
    { id: 'none', label: 'Keines', file: 'none.svg', unlocked: true },
    { id: 'crown', label: 'Krone', file: 'none.svg', unlocked: false },
    { id: 'cape', label: 'Umhang', file: 'none.svg', unlocked: false }
  ]
}

export function getOptionLabel(group, id) {
  return avatarOptions[group]?.find(x => x.id === id)?.label || id || '-'
}

export function getNextOption(group, currentId, direction = 1, unlockedIds = []) {
  const options = avatarOptions[group] || []
  const available = options.filter(option => option.unlocked || unlockedIds.includes(option.id))

  if (available.length === 0) return currentId

  const currentIndex = Math.max(0, available.findIndex(option => option.id === currentId))
  const nextIndex = (currentIndex + direction + available.length) % available.length

  return available[nextIndex].id
}
