export interface ArtworkUrls {
  horizontal: string;
  vertical: string;
  banner: string;
  horizontal_webp: string;
  vertical_webp: string;
  banner_webp: string;
}

export interface ArtworkFiles {
  horizontal: string;
  vertical: string;
  banner: string;
}

export interface Artwork {
  id: string;
  name: string;
  artist: string | null;
  urls: ArtworkUrls;
  files: ArtworkFiles;
  createdAt: string;
  updatedAt: string;
}
