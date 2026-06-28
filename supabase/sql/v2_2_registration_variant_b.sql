-- Fun Cup V2 - Variante B: Selbstregistrierung + Admin-Freigabe
-- Im Supabase SQL Editor ausführen.

alter table public.players
  add column if not exists user_id uuid unique references auth.users(id) on delete set null,
  add column if not exists email text,
  add column if not exists aka_name text,
  add column if not exists approved boolean not null default false;

do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name = 'players'
      and column_name = 'active'
  ) then
    execute 'alter table public.players alter column active set default false';
  end if;
end $$;

create or replace function public.handle_new_player_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_player_id uuid;
  player_name text;
  player_aka text;
begin
  player_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));
  player_aka := coalesce(new.raw_user_meta_data->>'aka_name', '');

  insert into public.players (name, email, aka_name, user_id, approved, active)
  values (player_name, new.email, player_aka, new.id, false, false)
  returning id into new_player_id;

  insert into public.player_profiles (user_id, player_id, display_name, avatar_body, avatar_belly)
  values (new.id, new_player_id, player_name, 'black', 'white');

  return new;
exception
  when undefined_column then
    insert into public.players (name, email, aka_name, user_id, approved)
    values (player_name, new.email, player_aka, new.id, false)
    returning id into new_player_id;

    insert into public.player_profiles (user_id, player_id, display_name, avatar_body, avatar_belly)
    values (new.id, new_player_id, player_name, 'black', 'white');

    return new;
end;
$$;

drop trigger if exists on_auth_user_created_create_player on auth.users;

create trigger on_auth_user_created_create_player
after insert on auth.users
for each row execute function public.handle_new_player_signup();

create or replace function public.approve_player(target_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  update public.players
  set approved = true,
      active = true
  where id = target_player_id;
exception
  when undefined_column then
    update public.players
    set approved = true
    where id = target_player_id;
end;
$$;

create or replace function public.block_player(target_player_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Not allowed';
  end if;

  update public.players
  set approved = false,
      active = false
  where id = target_player_id;
exception
  when undefined_column then
    update public.players
    set approved = false
    where id = target_player_id;
end;
$$;
