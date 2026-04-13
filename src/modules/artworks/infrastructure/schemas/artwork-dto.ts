import type { Artwork, ArtworkFiles, ArtworkUrls } from '../../domain/entities/artwork';

export interface ArtworkDto {
  id: string;
  name: string;
  artist: string | null;
  urls: ArtworkUrls;
  files: ArtworkFiles;
  created_at: string;
  updated_at: string;
}

// API returns relative paths like /storage/artworks/file.jpg — prefix with origin.
const storageOrigin =
  (process.env.NEXT_PUBLIC_STORAGE_BASE_URL ?? '').replace(/\/storage\/?$/, '') ||
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/api\/?$/, '');

const abs = (path: string) => (path && !path.startsWith('http') ? `${storageOrigin}${path}` : path);

const absoluteUrls = (urls: ArtworkUrls): ArtworkUrls => ({
  horizontal:       abs(urls.horizontal),
  vertical:         abs(urls.vertical),
  banner:           abs(urls.banner),
  horizontal_webp:  abs(urls.horizontal_webp),
  vertical_webp:    abs(urls.vertical_webp),
  banner_webp:      abs(urls.banner_webp),
});

export const toArtworkEntity = (dto: ArtworkDto): Artwork => ({
  id: dto.id,
  name: dto.name,
  artist: dto.artist,
  urls: absoluteUrls(dto.urls),
  files: dto.files,
  createdAt: dto.created_at,
  updatedAt: dto.updated_at,
});
