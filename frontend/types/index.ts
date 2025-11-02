
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
  category: Array<string>;
  primary_category: string
}


export interface EmbeddingsData {
  coordinates: {
    id: string;
    x: number;
    y: number;
    z: number;
  }[];
  details: Record<
    string,
    {
      title: string;
      authors: string;
      year: number;
      category: Array<string>;
      primary_category: string;
      abstract: string;
    }
  >;
  metadata: Record<string, any>;
  statistics: {
    top_categories: Record<string, number>;
    [key: string]: any;
  };
};
