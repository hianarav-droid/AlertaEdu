-- Presença Inteligente — esquema inicial PostgreSQL para Supabase
-- Use SOMENTE dados fictícios neste protótipo.
-- As políticas abaixo permitem acesso aos dados para qualquer usuário autenticado.
-- Para uma implantação real, limite por escola, função e necessidade de acesso.

create extension if not exists pgcrypto;

create table if not exists public.classes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  class_id uuid references public.classes(id) on delete set null,
  class_name text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  attendance_date date not null,
  status text not null check (status in ('present','absent','excused')),
  note text,
  recorded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  unique(student_id, attendance_date)
);

create table if not exists public.followups (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.students(id) on delete cascade,
  reason text not null default 'Motivo ainda não identificado',
  action text not null,
  review_date date,
  status text not null default 'Aberto' check (status in ('Aberto','Em andamento','Concluído','Novo','Aguardando conversa')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists attendance_student_date_idx on public.attendance(student_id, attendance_date desc);
create index if not exists followups_student_created_idx on public.followups(student_id, created_at desc);

alter table public.classes enable row level security;
alter table public.students enable row level security;
alter table public.attendance enable row level security;
alter table public.followups enable row level security;

-- Remove grants amplos e libera apenas operações a usuários autenticados.
revoke all on public.classes, public.students, public.attendance, public.followups from anon;
revoke all on public.classes, public.students, public.attendance, public.followups from authenticated;
grant select, insert, update, delete on public.classes, public.students, public.attendance, public.followups to authenticated;

drop policy if exists "authenticated users manage classes demo" on public.classes;
create policy "authenticated users manage classes demo" on public.classes
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users manage students demo" on public.students;
create policy "authenticated users manage students demo" on public.students
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users manage attendance demo" on public.attendance;
create policy "authenticated users manage attendance demo" on public.attendance
for all to authenticated using (true) with check (true);

drop policy if exists "authenticated users manage followups demo" on public.followups;
create policy "authenticated users manage followups demo" on public.followups
for all to authenticated using (true) with check (true);

-- Dados iniciais inventados. Execute esta seção uma única vez se quiser a carga de exemplo.
insert into public.classes(name) values ('2º A'),('2º B'),('2º C') on conflict (name) do nothing;

insert into public.students(full_name, class_id, class_name)
select v.full_name, c.id, v.class_name
from (values
 ('Ana Martins','2º A'),('Bruno Lima','2º A'),('Camila Rocha','2º B'),
 ('Diego Alves','2º A'),('Eduarda Souza','2º C'),('Felipe Costa','2º B'),
 ('Giovana Melo','2º C'),('Heitor Nunes','2º A'),('Isabela Freire','2º B'),
 ('João Pedro','2º C'),('Larissa Gomes','2º A'),('Mateus Ribeiro','2º B')
) as v(full_name,class_name)
join public.classes c on c.name=v.class_name
where not exists (select 1 from public.students s where s.full_name=v.full_name and s.class_name=v.class_name);
