import { supabase } from '../api/supabase'

export async function getMyProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const user = userData.user
  if (!user) return null

  const { data, error } = await supabase
    .from('player_profiles')
    .select('*, players(name, aka_name, email, approved, active)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateMyAvatar(profileId, avatar) {
  const { data, error } = await supabase
    .from('player_profiles')
    .update({
      body_color: avatar.body_color,
      belly_color: avatar.belly_color,
      avatar_body: avatar.body_color,
      avatar_belly: avatar.belly_color,
      head_item: avatar.head_item,
      shorts_item: avatar.shorts_item,
      accessory_item: avatar.accessory_item
    })
    .eq('id', profileId)
    .select()
    .single()

  if (error) throw error
  return data
}
