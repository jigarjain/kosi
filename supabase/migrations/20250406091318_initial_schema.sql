create table "public"."entries" (
    "id" uuid not null default gen_random_uuid(),
    "page_id" uuid not null,
    "content" bytea not null,
    "iv" bytea not null,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


alter table "public"."entries" enable row level security;

create table "public"."pages" (
    "id" uuid not null default gen_random_uuid(),
    "user_id" uuid not null,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


alter table "public"."pages" enable row level security;

create table "public"."users" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "username" text not null,
    "encrypted_dek_mk" bytea not null,
    "iv_mk" bytea not null,
    "encrypted_dek_rk" bytea not null,
    "iv_rk" bytea not null,
    "password_salt" bytea not null,
    "hashed_authkey" bytea not null,
    "authkey_salt" bytea not null,
    "created_at" timestamp without time zone not null default now(),
    "updated_at" timestamp without time zone not null default now()
);


alter table "public"."users" enable row level security;

CREATE UNIQUE INDEX entries_pkey ON public.entries USING btree (id);

CREATE INDEX idx_entries_id ON public.entries USING btree (id);

CREATE INDEX idx_entries_page_id ON public.entries USING btree (page_id);

CREATE INDEX idx_pages_id ON public.pages USING btree (id);

CREATE INDEX idx_pages_user_id ON public.pages USING btree (user_id);

CREATE INDEX idx_pages_user_id_date ON public.pages USING btree (user_id, created_at);

CREATE INDEX idx_users_id ON public.users USING btree (id);

CREATE INDEX idx_users_username ON public.users USING btree (username);

CREATE UNIQUE INDEX pages_pkey ON public.pages USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

CREATE UNIQUE INDEX users_username_key ON public.users USING btree (username);

alter table "public"."entries" add constraint "entries_pkey" PRIMARY KEY using index "entries_pkey";

alter table "public"."pages" add constraint "pages_pkey" PRIMARY KEY using index "pages_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."entries" add constraint "entries_page_id_fkey" FOREIGN KEY (page_id) REFERENCES pages(id) ON DELETE CASCADE not valid;

alter table "public"."entries" validate constraint "entries_page_id_fkey";

alter table "public"."pages" add constraint "pages_user_id_fkey" FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE not valid;

alter table "public"."pages" validate constraint "pages_user_id_fkey";

alter table "public"."users" add constraint "users_username_key" UNIQUE using index "users_username_key";

grant delete on table "public"."entries" to "anon";

grant insert on table "public"."entries" to "anon";

grant references on table "public"."entries" to "anon";

grant select on table "public"."entries" to "anon";

grant trigger on table "public"."entries" to "anon";

grant truncate on table "public"."entries" to "anon";

grant update on table "public"."entries" to "anon";

grant delete on table "public"."entries" to "authenticated";

grant insert on table "public"."entries" to "authenticated";

grant references on table "public"."entries" to "authenticated";

grant select on table "public"."entries" to "authenticated";

grant trigger on table "public"."entries" to "authenticated";

grant truncate on table "public"."entries" to "authenticated";

grant update on table "public"."entries" to "authenticated";

grant delete on table "public"."entries" to "service_role";

grant insert on table "public"."entries" to "service_role";

grant references on table "public"."entries" to "service_role";

grant select on table "public"."entries" to "service_role";

grant trigger on table "public"."entries" to "service_role";

grant truncate on table "public"."entries" to "service_role";

grant update on table "public"."entries" to "service_role";

grant delete on table "public"."pages" to "anon";

grant insert on table "public"."pages" to "anon";

grant references on table "public"."pages" to "anon";

grant select on table "public"."pages" to "anon";

grant trigger on table "public"."pages" to "anon";

grant truncate on table "public"."pages" to "anon";

grant update on table "public"."pages" to "anon";

grant delete on table "public"."pages" to "authenticated";

grant insert on table "public"."pages" to "authenticated";

grant references on table "public"."pages" to "authenticated";

grant select on table "public"."pages" to "authenticated";

grant trigger on table "public"."pages" to "authenticated";

grant truncate on table "public"."pages" to "authenticated";

grant update on table "public"."pages" to "authenticated";

grant delete on table "public"."pages" to "service_role";

grant insert on table "public"."pages" to "service_role";

grant references on table "public"."pages" to "service_role";

grant select on table "public"."pages" to "service_role";

grant trigger on table "public"."pages" to "service_role";

grant truncate on table "public"."pages" to "service_role";

grant update on table "public"."pages" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";

create policy "Allow User Access to Own Entry data"
on "public"."entries"
as permissive
for select
to public
using ((page_id IN ( SELECT pages.id
   FROM pages
  WHERE (pages.user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))::uuid))));


create policy "Allow User Access to Own Page data"
on "public"."pages"
as permissive
for select
to public
using ((user_id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))::uuid));


create policy "Allow User Access to Own User data"
on "public"."users"
as permissive
for select
to public
using ((id = (((current_setting('request.jwt.claims'::text, true))::json ->> 'user_id'::text))::uuid));



