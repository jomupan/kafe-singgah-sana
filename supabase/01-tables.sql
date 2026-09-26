-- Kafe Singgah Sana: step 1, create tables (run first on a fresh project)
create table menu_items (id uuid primary key default gen_random_uuid(), name text not null, category text not null, price numeric(6,2) not null, image_url text, available boolean default true);
create table reservations (id uuid primary key default gen_random_uuid(), name text not null, phone text not null, date date not null, time time not null, pax int not null check (pax > 0), status text default 'pending' check (status in ('pending','confirmed','cancelled')), created_at timestamptz default now());
create table orders (id uuid primary key default gen_random_uuid(), table_number int not null, note text, total numeric(8,2) not null, status text default 'new' check (status in ('new','preparing','served','cancelled')), created_at timestamptz default now());
create table order_items (id uuid primary key default gen_random_uuid(), order_id uuid references orders(id) on delete cascade, menu_item_id uuid references menu_items(id), qty int not null check (qty > 0), price numeric(6,2) not null);
alter table menu_items enable row level security; alter table reservations enable row level security; alter table orders enable row level security; alter table order_items enable row level security;
create policy "public reads menu" on menu_items for select using (true);
create policy "public books" on reservations for insert to anon with check (true);
create policy "public orders" on orders for insert to anon with check (true);
create policy "public order items" on order_items for insert to anon with check (true);
create policy "staff all menu" on menu_items for all to authenticated using (true) with check (true);
create policy "staff all reservations" on reservations for all to authenticated using (true) with check (true);
create policy "staff all orders" on orders for all to authenticated using (true) with check (true);
create policy "staff all order items" on order_items for all to authenticated using (true) with check (true);
