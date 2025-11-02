
export interface Coordinate {
  id: string;
  x: number;
  y: number;
  z: number;
}

export interface PaperDetails {
  title: string;
  authors: string;
  abstract?: string;
  year?: number;
  category?: string;
}

export interface EmbeddingsData {
  coordinates: Coordinate[];
  details: Record<string, PaperDetails>;
  metadata?: Record<string, any>;
}