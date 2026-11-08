import { supabase, IMAGE_BUCKET } from './supabase';
import { slugify } from '../../api/_lib/slug.js';

// Görseli tarayıcıda küçültüp WebP'ye çevirir: hızlı sayfa = daha iyi SEO
async function compress(file, maxWidth = 1600, quality = 0.82) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif' || file.type === 'image/svg+xml') return file;
  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', quality));
  if (!blob || blob.size >= file.size) return file;
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + '.webp', { type: 'image/webp' });
}

export async function uploadImage(file) {
  if (file.size > 15 * 1024 * 1024) throw new Error('Görsel 15 MB’tan büyük olamaz.');
  const ready = await compress(file);
  const ext = (ready.name.split('.').pop() || 'jpg').toLowerCase();
  const base = slugify(ready.name.replace(/\.[^.]+$/, '')) || 'gorsel';
  const path = `${new Date().toISOString().slice(0, 7)}/${Date.now()}-${base}.${ext}`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(path, ready, {
    cacheControl: '31536000',
    contentType: ready.type,
    upsert: false,
  });
  if (error) throw error;
  return supabase.storage.from(IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export function pickImage() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => resolve(input.files?.[0] || null);
    input.click();
  });
}
