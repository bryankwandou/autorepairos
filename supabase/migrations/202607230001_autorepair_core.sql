create table if not exists estimate_line_items (
  id uuid primary key default gen_random_uuid(),
  work_order_id uuid not null,
  description text not null,
  estimated_parts_cost numeric(10,2) not null default 0,
  estimated_labor_cost numeric(10,2) not null default 0,
  approval_status text not null default 'pending' check (approval_status in ('pending','approved','declined')),
  approval_token_hash text unique not null,
  token_expires_at timestamptz not null,
  approved_at timestamptz,
  created_at timestamptz not null default now()
);
create table if not exists labor_logs (id uuid primary key default gen_random_uuid(),line_item_id uuid not null references estimate_line_items(id),technician_id uuid not null,minutes integer not null check(minutes>0),logged_at timestamptz not null default now());
create table if not exists parts_logs (id uuid primary key default gen_random_uuid(),line_item_id uuid not null references estimate_line_items(id),part_name text not null,actual_cost numeric(10,2) not null check(actual_cost>0),logged_by uuid not null,logged_at timestamptz not null default now());
create or replace function enforce_customer_approval() returns trigger language plpgsql as $$ begin if not exists(select 1 from estimate_line_items where id=new.line_item_id and approval_status='approved') then raise exception 'customer approval required before logging work'; end if; return new; end $$;
drop trigger if exists labor_requires_approval on labor_logs;
create trigger labor_requires_approval before insert on labor_logs for each row execute function enforce_customer_approval();
drop trigger if exists parts_require_approval on parts_logs;
create trigger parts_require_approval before insert on parts_logs for each row execute function enforce_customer_approval();
alter table labor_logs enable row level security;
alter table parts_logs enable row level security;
create policy "labor requires approved line" on labor_logs for insert with check(exists(select 1 from estimate_line_items i where i.id=line_item_id and i.approval_status='approved'));
create policy "parts require approved line" on parts_logs for insert with check(exists(select 1 from estimate_line_items i where i.id=line_item_id and i.approval_status='approved'));
