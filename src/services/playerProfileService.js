import { supabase } from '../api/supabase'

export async function getMyProfile() {
  const { data: userData, error: userError } = await supabase.auth.getUser()
  if (userError) throw userError

  const user = userData.user
  if (!user) return null

  const { data, error } = await supabase
    .from('player_profiles')
    .select('*, players(name, email, approved, active)')
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function loadProfileChoices(profile) {
  const level = Number(profile?.level || 1)

  const [titles, attacks] = await Promise.all([
    supabase
      .from('player_titles')
      .select('*')
      .eq('active', true)
      .order('sort_order'),
    supabase
      .from('special_attacks')
      .select('*')
      .eq('active', true)
      .lte('min_level', level)
      .order('sort_order')
  ])

  if (titles.error) throw titles.error
  if (attacks.error) throw attacks.error

  const unlockedTitles = (titles.data || []).map(title => {
    const unlocked =
      level >= Number(title.min_level || 1) &&
      Number(profile?.stat_teamgeist || 0) >= Number(title.req_teamgeist || 0) &&
      Number(profile?.stat_geschwindigkeit || 0) >= Number(title.req_geschwindigkeit || 0) &&
      Number(profile?.stat_kraft || 0) >= Number(title.req_kraft || 0) &&
      Number(profile?.stat_technik || 0) >= Number(title.req_technik || 0) &&
      Number(profile?.stat_ehrgeiz || 0) >= Number(title.req_ehrgeiz || 0)

    return { ...title, unlocked }
  })

  return {
    titles: unlockedTitles,
    attacks: attacks.data || []
  }
}

export async function updateMyProfileChoices(profileId, choices) {
  const { error } = await supabase.rpc('update_my_profile_choices', {
    new_title_id: choices.selected_title_id || null,
    new_special_attack_id: choices.selected_special_attack_id || null,
    new_body_color: choices.body_color || null,
    new_head_item: choices.head_item || null,
    new_top_item: choices.top_item || null,
    new_bottom_item: choices.bottom_item || null
  })

  if (error) {
    const fallback = await supabase
      .from('player_profiles')
      .update({
        selected_title_id: choices.selected_title_id || null,
        selected_special_attack_id: choices.selected_special_attack_id || null,
        body_color: choices.body_color,
        head_item: choices.head_item,
        top_item: choices.top_item,
        bottom_item: choices.bottom_item,
        shorts_item: choices.bottom_item
      })
      .eq('id', profileId)

    if (fallback.error) throw error
  }
}

export async function allocateMyStatPoints(points) {
  const { error } = await supabase.rpc('allocate_my_stat_points', {
    add_teamgeist: Number(points.teamgeist || 0),
    add_geschwindigkeit: Number(points.geschwindigkeit || 0),
    add_kraft: Number(points.kraft || 0),
    add_technik: Number(points.technik || 0),
    add_ehrgeiz: Number(points.ehrgeiz || 0)
  })

  if (error) throw error
}

export async function updateMyAvatar(profileId, avatar) {
  return updateMyProfileChoices(profileId, {
    selected_title_id: avatar.selected_title_id,
    selected_special_attack_id: avatar.selected_special_attack_id,
    body_color: avatar.body_color,
    head_item: avatar.head_item,
    top_item: avatar.top_item,
    bottom_item: avatar.bottom_item || avatar.shorts_item
  })
}
