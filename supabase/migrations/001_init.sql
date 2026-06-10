-- AppShield Dashboard — Initial Schema
-- Run this in your Supabase SQL editor

create extension if not exists "uuid-ossp";

-- Projects table
create table if not exists projects (
  id uuid primary key default uuid_generate_v4(),
  user_id text not null,
  repo_full_name text not null,
  repo_url text,
  last_scanned timestamptz,
  health_score integer,
  created_at timestamptz default now(),
  unique(user_id, repo_full_name)
);

-- Document scans table
create table if not exists document_scans (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references projects(id) on delete cascade,
  doc_name text not null,
  present boolean default false,
  placeholder_count integer default 0,
  last_commit_date timestamptz,
  score integer default 0,
  scanned_at timestamptz default now()
);

-- Indexes
create index if not exists idx_projects_user_id on projects(user_id);
create index if not exists idx_document_scans_project_id on document_scans(project_id);
create index if not exists idx_document_scans_scanned_at on document_scans(scanned_at);

-- Row Level Security
alter table projects enable row level security;
alter table document_scans enable row level security;

create policy "Users can manage own projects"
  on projects for all
  using (user_id = current_setting('request.jwt.claims', true)::json->>'sub');

create policy "Users can view own document scans"
  on document_scans for all
  using (
    project_id in (
      select id from projects
      where user_id = current_setting('request.jwt.claims', true)::json->>'sub'
    )
  );
