-- Match English skill names regardless of letter case, while preserving display text.
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
      and exists (
        select 1
        from unnest(a.teach) as taught(skill)
        join unnest(b.learn) as wanted(skill)
          on lower(btrim(taught.skill)) = lower(btrim(wanted.skill))
      )
      and exists (
        select 1
        from unnest(b.teach) as taught(skill)
        join unnest(a.learn) as wanted(skill)
          on lower(btrim(taught.skill)) = lower(btrim(wanted.skill))
      )
  );
$$;
