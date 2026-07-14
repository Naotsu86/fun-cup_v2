import { supabase } from '../api/supabase'
import { calculateForm } from './generator'

async function loadPlayerCards() {
  const rpc = await supabase.rpc('get_player_cards')

  if (!rpc.error) return rpc.data || []

  console.warn('get_player_cards konnte nicht geladen werden:', rpc.error.message)

  const view = await supabase.from('player_card_view').select('*')

  if (view.error) {
    console.warn('player_card_view konnte nicht geladen werden:', view.error.message)
    return []
  }

  return view.data || []
}

async function loadPointLedger() {
  const { data, error } = await supabase.rpc('get_point_ledger_data')

  if (error) throw error

  return {
    awards: data?.awards || [],
    adjustments: data?.adjustments || []
  }
}

export async function loadAll() {
  const [p, m, s, cards, ledger] = await Promise.all([
    supabase.from('players').select('*').order('created_at', { ascending: true }),
    supabase.from('matches').select('*').order('created_at', { ascending: true }),
    supabase.from('settings').select('*').eq('id', 'main').maybeSingle(),
    loadPlayerCards(),
    loadPointLedger()
  ])

  if (p.error) throw p.error
  if (m.error) throw m.error
  if (s.error) throw s.error

  const awards = ledger.awards
  const adjustments = ledger.adjustments

  const cardByPlayerId = Object.fromEntries(
    (cards || []).map(row => [row.player_id, row])
  )

  const adjustmentByPlayerId = Object.fromEntries(
    (adjustments || []).map(row => [row.player_id, Number(row.points || 0)])
  )

  const awardsByMatchId = {}

  for (const award of awards || []) {
    if (!awardsByMatchId[award.match_id]) awardsByMatchId[award.match_id] = []

    awardsByMatchId[award.match_id].push({
      ...award,
      points: Number(award.points || 0),
      games: Number(award.games || 0),
      wins: Number(award.wins || 0),
      point_diff: Number(award.point_diff || 0)
    })
  }

  const matches = (m.data || []).map(match => ({
    ...match,
    point_awards: awardsByMatchId[match.id] || []
  }))

  const players = (p.data || []).map(player => {
    const card = cardByPlayerId[player.id] || {}

    return {
      ...player,
      ...card,

      id: player.id,
      name: player.name,
      email: player.email,
      active: player.active,
      approved: player.approved,
      strength: player.strength,
      form: player.form,

      point_adjustment: adjustmentByPlayerId[player.id] || 0,

      xp_total: Number(card.xp_total || 0),
      calculated_level: Number(card.calculated_level || 1),
      current_level_xp: Number(card.current_level_xp || 0),
      next_level_xp: Number(card.next_level_xp || 25),

      stat_points_total: Number(card.stat_points_total || 0),
      stat_points_spent: Number(card.stat_points_spent || 0),
      stat_points_available: Number(card.stat_points_available || 0),

      stat_teamgeist: Number(card.stat_teamgeist || 0),
      stat_geschwindigkeit: Number(card.stat_geschwindigkeit || 0),
      stat_kraft: Number(card.stat_kraft || 0),
      stat_technik: Number(card.stat_technik || 0),
      stat_ehrgeiz: Number(card.stat_ehrgeiz || 0),

      selected_title_id: card.selected_title_id || null,
      selected_title_name: card.selected_title_name || null,
      selected_title_description: card.selected_title_description || null,

      selected_special_attack_id: card.selected_special_attack_id || null,
      selected_special_attack_name: card.selected_special_attack_name || null,
      selected_special_attack_description: card.selected_special_attack_description || null,

      body_color: card.body_color || player.body_color || 'black',
      head_item: card.head_item || player.head_item || 'none',
      top_item: card.top_item || player.top_item || 'none',
      bottom_item:
        card.bottom_item ||
        card.shorts_item ||
        player.shorts_item ||
        'none',
      shorts_item:
        card.bottom_item ||
        card.shorts_item ||
        player.shorts_item ||
        'none',
      accessory_item:
        card.accessory_item ||
        player.accessory_item ||
        'none'
    }
  })

  return {
    players,
    matches,
    settings: s.data?.value || {}
  }
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
  const changesScore =
    Object.prototype.hasOwnProperty.call(patch, 'score_a') ||
    Object.prototype.hasOwnProperty.call(patch, 'score_b')

  if (changesScore) {
    const { data: current, error: readError } = await supabase
      .from('matches')
      .select('score_a, score_b')
      .eq('id', id)
      .single()

    if (readError) throw readError

    const scoreA = Object.prototype.hasOwnProperty.call(patch, 'score_a')
      ? patch.score_a
      : current.score_a

    const scoreB = Object.prototype.hasOwnProperty.call(patch, 'score_b')
      ? patch.score_b
      : current.score_b

    const { error } = await supabase.rpc('save_match_score', {
      target_match_id: id,
      new_score_a: Number(scoreA),
      new_score_b: Number(scoreB)
    })

    if (error) throw error
    return
  }

  const { error } = await supabase.from('matches').update(patch).eq('id', id)
  if (error) throw error
}

export async function deleteMatch(id) {
  const { error } = await supabase.rpc('delete_match_with_points', {
    target_match_id: id
  })

  if (error) throw error
}

export async function updateSettings(value) {
  const { error } = await supabase
    .from('settings')
    .upsert({ id: 'main', value })

  if (error) throw error
}

export async function updateForms(players, matches) {
  const form = calculateForm(players, matches)

  await Promise.all(
    players.map(player =>
      supabase
        .from('players')
        .update({ form: form[player.id] || 0 })
        .eq('id', player.id)
    )
  )
}
