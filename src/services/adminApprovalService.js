import { supabase } from '../api/supabase'

export async function loadPendingPlayers() {
  const { data, error } = await supabase
    .from('players')
    .select('id, name, aka_name, email, approved, active')
    .eq('approved', false)
    .order('name')

  if (error) throw error
  return data || []
}

export async function approvePlayer(playerId) {
  const { error } = await supabase.rpc('approve_player', {
    target_player_id: playerId
  })

  if (error) throw error
}

export async function blockPlayer(playerId) {
  const { error } = await supabase.rpc('block_player', {
    target_player_id: playerId
  })

  if (error) throw error
}
