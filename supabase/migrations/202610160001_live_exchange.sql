-- Real accounts and private conversations. Run in the Supabase SQL editor once.
create table if not exists public.skill_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null check (char_length(btrim(name)) between 1 and 20),
  intro text not null default '' check (char_length(intro) <= 140),
  teach text[] not null default '{}',
  learn text[] not null default '{}',
  mode text not null default '线上' check (mode in ('线上', '线上或线下', '线下优先')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint skill_profiles_teach_count check (cardinality(teach) between 1 and 8),
  constraint skill_profiles_learn_count check (cardinality(learn) between 1 and 8),
  constraint skill_profiles_no_overlap check (not (teach && learn))
);

create table if not exists public.skill_conversations (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.skill_profiles(id) on delete cascade,
  user_b uuid not null references public.skill_profiles(id) on delete cascade,
  created_by uuid not null references public.skill_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint skill_conversations_order check (user_a < user_b),
  constraint skill_conversations_unique_pair unique (user_a, user_b),
  constraint skill_conversations_creator check (created_by in (user_a, user_b))
);

create table if not exists public.skill_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.skill_conversations(id) on delete cascade,
  sender_id uuid not null references public.skill_profiles(id) on delete cascade,
  body text not null check (char_length(btrim(body)) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index if not exists skill_messages_conversation_time
  on public.skill_messages (conversation_id, created_at, id);

-- The matching rule is enforced again in the database, not only in the browser.
create or replace function public.skill_is_mutual_match(first_id uuid, second_id uuid)
returns boolean
language sql stable security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.skill_profiles a
    join public.skill_profiles b on b.id = second_id
    where a.id = first_id
      and a.teach && b.learn
      and b.teach && a.learn
  );
$$;

revoke all on function public.skill_is_mutual_match(uuid, uuid) from public, anon;
grant execute on function public.skill_is_mutual_match(uuid, uuid) to authenticated;

alter table public.skill_profiles enable row level security;
alter table public.skill_conversations enable row level security;
alter table public.skill_messages enable row level security;

revoke all on public.skill_profiles, public.skill_conversations, public.skill_messages from anon;
revoke all on public.skill_profiles, public.skill_conversations, public.skill_messages from authenticated;
grant select, insert on public.skill_profiles to authenticated;
grant update (name, intro, teach, learn, mode, updated_at) on public.skill_profiles to authenticated;
grant select, insert on public.skill_conversations to authenticated;
grant select, insert on public.skill_messages to authenticated;

create policy "Authenticated members can discover skill cards"
  on public.skill_profiles for select to authenticated using (true);
create policy "Members create their own skill card"
  on public.skill_profiles for insert to authenticated
  with check ((select auth.uid()) = id);
create policy "Members edit their own skill card"
  on public.skill_profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Conversation participants can read"
  on public.skill_conversations for select to authenticated
  using ((select auth.uid()) in (user_a, user_b));
create policy "Matched members can start a conversation"
  on public.skill_conversations for insert to authenticated
  with check (
    (select auth.uid()) = created_by
    and (select auth.uid()) in (user_a, user_b)
    and public.skill_is_mutual_match(user_a, user_b)
  );

create policy "Conversation participants can read messages"
  on public.skill_messages for select to authenticated
  using (exists (
    select 1 from public.skill_conversations c
    where c.id = conversation_id
      and (select auth.uid()) in (c.user_a, c.user_b)
  ));
create policy "Conversation participants can send messages"
  on public.skill_messages for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.skill_conversations c
      where c.id = conversation_id
        and (select auth.uid()) in (c.user_a, c.user_b)
    )
  );

-- Postgres Changes streams only rows visible through SELECT + RLS.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public'
      and tablename = 'skill_messages'
  ) then
    alter publication supabase_realtime add table public.skill_messages;
  end if;
end $$;
