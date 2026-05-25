-- Supabase Storage: ürün görselleri (isteğe bağlı — yoksa görseller public/catalog/ klasörüne kaydedilir)
insert into storage.buckets (id, name, public)
values ('catalog-images', 'catalog-images', true)
on conflict (id) do update set public = true;

drop policy if exists "catalog_images_public_read" on storage.objects;
create policy "catalog_images_public_read"
  on storage.objects for select
  using (bucket_id = 'catalog-images');
