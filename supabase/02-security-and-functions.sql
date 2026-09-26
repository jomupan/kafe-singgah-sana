-- ============================================================
-- Kafe Singgah Sana: database upgrade
-- Step 2. Run in Supabase > SQL Editor after 01-tables.sql. Safe to run again.
-- ============================================================

-- 1. Extra columns
alter table menu_items add column if not exists description text;
alter table reservations add column if not exists note text;

-- 2. Staff list: only accounts in this table can use /admin
create table if not exists staff (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table staff enable row level security;

create or replace function is_staff() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from staff where user_id = auth.uid());
$$;

drop policy if exists "staff see self" on staff;
create policy "staff see self" on staff for select to authenticated using (user_id = auth.uid());

-- 3. Staff policies now check the staff list (not just "logged in")
drop policy if exists "staff all menu" on menu_items;
drop policy if exists "staff all reservations" on reservations;
drop policy if exists "staff all orders" on orders;
drop policy if exists "staff all order items" on order_items;

create policy "staff all menu" on menu_items for all to authenticated using (is_staff()) with check (is_staff());
create policy "staff all reservations" on reservations for all to authenticated using (is_staff()) with check (is_staff());
create policy "staff all orders" on orders for all to authenticated using (is_staff()) with check (is_staff());
create policy "staff all order items" on order_items for all to authenticated using (is_staff()) with check (is_staff());

-- 4. Safer public booking: no past dates, sensible sizes
drop policy if exists "public books" on reservations;
create policy "public books" on reservations for insert to anon, authenticated
with check (
  date >= (now() at time zone 'Asia/Kuala_Lumpur')::date
  and pax between 1 and 20
  and char_length(name) between 1 and 80
  and char_length(phone) between 7 and 20
  and status = 'pending'
);

-- 5. Customers order through a function instead of writing to tables directly.
--    The function reads prices from the menu, so nobody can fake a price.
drop policy if exists "public orders" on orders;
drop policy if exists "public order items" on order_items;

create or replace function place_order(p_table int, p_note text, p_items jsonb) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_order uuid;
  v_total numeric(8,2) := 0;
  v_item jsonb;
  v_price numeric(6,2);
  v_qty int;
begin
  if p_table is null or p_table < 1 or p_table > 100 then raise exception 'Invalid table'; end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty';
  end if;
  if jsonb_array_length(p_items) > 50 then raise exception 'Too many items'; end if;

  insert into orders (table_number, note, total) values (p_table, left(p_note, 300), 0) returning id into v_order;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := (v_item->>'qty')::int;
    if v_qty is null or v_qty < 1 or v_qty > 20 then raise exception 'Invalid quantity'; end if;

    v_price := null;
    select price into v_price from menu_items where id = (v_item->>'id')::uuid and available;
    if v_price is null then raise exception 'Sorry, an item in your cart is no longer available'; end if;

    insert into order_items (order_id, menu_item_id, qty, price)
    values (v_order, (v_item->>'id')::uuid, v_qty, v_price);
    v_total := v_total + v_price * v_qty;
  end loop;

  update orders set total = v_total where id = v_order;
  return v_order;
end $$;

-- Customers can check the status of their own order (they need the order id)
create or replace function get_order_status(p_order_id uuid) returns text
language sql stable security definer set search_path = public as $$
  select status from orders where id = p_order_id;
$$;

revoke all on function place_order(int, text, jsonb) from public;
revoke all on function get_order_status(uuid) from public;
revoke all on function is_staff() from public;
grant execute on function place_order(int, text, jsonb) to anon, authenticated;
grant execute on function get_order_status(uuid) to anon, authenticated;
grant execute on function is_staff() to anon, authenticated;

-- 6. Live updates for the admin dashboard
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'orders') then
    alter publication supabase_realtime add table orders;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and tablename = 'reservations') then
    alter publication supabase_realtime add table reservations;
  end if;
end $$;

-- 7. Sample menu (only added if the menu is empty). Edit later in /admin.
insert into menu_items (name, category, price, description)
select * from (values
  ('Nasi Lemak Ayam Goreng', 'Makanan', 12.90, 'Sambal pedas, telur, kacang, timun'),
  ('Mee Goreng Mamak', 'Makanan', 9.50, 'With egg and fried tofu'),
  ('Roti Bakar Kaya Butter', 'Makanan', 4.50, 'Classic kopitiam style'),
  ('Kopi O', 'Minuman', 3.00, 'Hot or iced'),
  ('Teh Tarik', 'Minuman', 3.50, 'Hot or iced'),
  ('Milo Ais', 'Minuman', 4.50, null),
  ('Kek Batik', 'Pencuci Mulut', 6.00, 'Homemade')
) as v(name, category, price, description)
where not exists (select 1 from menu_items);
