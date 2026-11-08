-- =====================================================================
-- Eray Ship Supply — Blog veritabanı şeması
-- Supabase panelinde: SQL Editor > New query > bu dosyanın tamamını yapıştır > Run
-- Birden fazla kez çalıştırmak güvenlidir.
-- =====================================================================

-- ---------- Yetkili kullanıcılar ----------
-- Sadece bu tabloda user_id'si olan kişiler yazı ekleyip düzenleyebilir.
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

drop policy if exists "admins can read own row" on public.admins;
create policy "admins can read own row" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ---------- Blog yazıları ----------
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft' check (status in ('draft', 'published')),
  cover_url text,

  -- Türkçe (ana dil — yazar bunu doldurur)
  slug_tr text not null,
  title_tr text not null,
  excerpt_tr text,
  meta_title_tr text,
  meta_desc_tr text,
  content_tr text not null default '',

  -- İngilizce (otomatik çeviri, düzenlenebilir)
  slug_en text,
  title_en text,
  excerpt_en text,
  meta_title_en text,
  meta_desc_en text,
  content_en text,

  -- Rusça (otomatik çeviri, düzenlenebilir)
  slug_ru text,
  title_ru text,
  excerpt_ru text,
  meta_title_ru text,
  meta_desc_ru text,
  content_ru text,

  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null
);

create unique index if not exists posts_slug_tr_key on public.posts (slug_tr);
create unique index if not exists posts_slug_en_key on public.posts (slug_en) where slug_en is not null;
create unique index if not exists posts_slug_ru_key on public.posts (slug_ru) where slug_ru is not null;
create index if not exists posts_status_published_idx on public.posts (status, published_at desc);

-- updated_at otomatik güncellensin; ilk yayında published_at dolsun
create or replace function public.posts_before_write()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

drop trigger if exists posts_before_write on public.posts;
create trigger posts_before_write
  before insert or update on public.posts
  for each row execute function public.posts_before_write();

alter table public.posts enable row level security;

-- Herkes sadece YAYINDAKİ yazıları okuyabilir
drop policy if exists "public can read published posts" on public.posts;
create policy "public can read published posts" on public.posts
  for select to anon, authenticated
  using (status = 'published');

-- Yetkililer her şeyi okuyabilir (taslaklar dahil)
drop policy if exists "admins can read all posts" on public.posts;
create policy "admins can read all posts" on public.posts
  for select to authenticated
  using (public.is_admin());

drop policy if exists "admins can insert posts" on public.posts;
create policy "admins can insert posts" on public.posts
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "admins can update posts" on public.posts;
create policy "admins can update posts" on public.posts
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admins can delete posts" on public.posts;
create policy "admins can delete posts" on public.posts
  for delete to authenticated
  using (public.is_admin());

-- ---------- Görsel deposu ----------
insert into storage.buckets (id, name, public)
values ('blog-images', 'blog-images', true)
on conflict (id) do update set public = true;

drop policy if exists "public can view blog images" on storage.objects;
create policy "public can view blog images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'blog-images');

drop policy if exists "admins can upload blog images" on storage.objects;
create policy "admins can upload blog images" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "admins can update blog images" on storage.objects;
create policy "admins can update blog images" on storage.objects
  for update to authenticated
  using (bucket_id = 'blog-images' and public.is_admin());

drop policy if exists "admins can delete blog images" on storage.objects;
create policy "admins can delete blog images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'blog-images' and public.is_admin());

-- =====================================================================
-- SON ADIM (kullanıcıyı oluşturduktan sonra ayrıca çalıştır):
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'seocu-arkadas@ornek.com';
-- =====================================================================
