import { put, del } from '@vercel/blob'

const MAX_BYTES = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export function validateArtCardFile(file: File): string | null {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return 'Only JPG, PNG, WEBP, or GIF images are allowed.'
  }
  if (file.size > MAX_BYTES) {
    return 'Image must be under 5MB.'
  }
  return null
}

export async function uploadArtCard(file: File): Promise<{ url: string; pathname: string }> {
  const blob = await put(`art-cards/${file.name}`, file, {
    access: 'public',
    addRandomSuffix: true,
  })
  return { url: blob.url, pathname: blob.pathname }
}

export async function deleteArtCard(pathname: string): Promise<void> {
  await del(pathname)
}
