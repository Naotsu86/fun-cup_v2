import { supabase } from '../api/supabase'
import { calculateForm } from './generator'

export async function loadAll() {
  const [p, m, s, pc] = await Promise.all([
    supabase.from('players').select('*').order('created_at', { ascending: true }),
    supabase.from('matches').select('*').order('created_at', { ascending: true }),
    supabase.from('settings').select('*').eq('id', 'main').maybeSingle(),
    supabase.from('player_card_view').select('*')
  ])

  if (p.error) throw p.error
  if (m.error) throw m.error
  if (s.error) throw s.error

  if (pc.error) {
    console.warn('player_card_view konnte nicht geladen werden:', pc.error.message)
  }

  const cardByPlayerId = Object.fromEntries((pc.data || []).map(row => [row.player_id, row]))

  const players = (p.data || []).map(player => {
    const card = cardByPlayerId[player.id]

    if (!card) return player

    return {
      ...player,
      ...card,

      // Ranking braucht weiterhin die echte player.id
      id: player.id,
      name: player.name,
      active: player.active,
      approved: player.approved,
      strength: player.strength,
      form: player.form,

      // Avatar-Kompatibilität
      body_color: card.body_color || player.body_color || 'black',
      head_item: card.head_item || player.head_item || 'none',
      top_item: card.top_item || player.top_item || 'none',
      bottom_item: card.bottom_item || card.shorts_item || player.shorts_item || 'none',
      shorts_item: card.bottom_item || card.shorts_item || player.shorts_item || 'none',
      accessory_item: card.accessory_item || player.accessory_item || 'none'
    }
  })

  return { players, matches: m.data || [], settings: s.data?.value || {} }
}

export async function addPlayer(row) {
  const { error } = await supabase.from('players').insert({
    name: row.name,
    strength: row.strength,
    form: 0,
    active: true
  })
  if (error) throw error
}

export async function updatePlayer(id, patch) {
  const { error } = await supabase.from('players').update(patch).eq('id', id)
  if (error) throw error
}

export async function deletePlayer(id) {
  const { error } = await supabase.from('players').delete().eq('id', id)
  if (error) throw error
}

export async function insertMatch(row) {
  const { error } = await supabase.from('matches').insert(row)
  if (error) throw error
}

export async function updateMatch(id, patch) {
  const { error } = await supabase.from('matches').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteMatch(id) {
  const { error } = await supabase.from('matches').delete().eq('id', id)
  if (error) throw error
}

export async function updateSettings(value) {
  const { error } = await supabase.from('settings').upsert({ id: 'main', value })
  if (error) throw error
}

export async function updateForms(players, matches) {
  const form = calculateForm(players, matches)

  await Promise.all(players.map(p =>
    supabase
      .from('players')
      .update({ form: form[p.id] || 0 })
      .eq('id', p.id)
  ))
}
