-- Users are handled by Supabase Auth (auth.users)

create table public.recasts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  created_at timestamptz default now(),
  input_type text not null check (input_type in ('upload', 'youtube', 'tiktok')),
  source_url text,
  source_filename text,
  video_title text,
  video_thumbnail_url text,
  transcript text not null,
  transcript_segments jsonb,       -- Whisper verbose_json segments with timestamps
  creator_voice text not null,
  target_audience text,
  primary_goal text,
  topic_context text,
  result jsonb,                    -- Full Claude JSON output
  viral_score integer,
  status text default 'pending' check (status in ('pending', 'transcribing', 'repurposing', 'complete', 'error')),
  error_message text
);

-- RLS: users can only access their own recasts
alter table public.recasts enable row level security;

create policy "Users access own recasts"
  on public.recasts for all
  using (auth.uid() = user_id);

-- Supabase Storage bucket for temp audio files
-- Create bucket named: recast-audio
-- Set to private. Files deleted after 1 hour via a cron or TTL policy.

create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_tier text default 'free',
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Function to automatically create a profile for new users
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
