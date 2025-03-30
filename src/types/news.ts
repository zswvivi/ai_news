export interface NewsItem {
  id: number;
  source_id: number;
  title: string;
  content: string;
  summary?: string;
  url: string;
  image_url?: string;
  author: string;
  published_at: string;
  external_id: string;
  created_at: string;
  updated_at: string;
  tags?: {
    id: number;
    name: string;
  }[];
  source?: {
    id: number;
    name: string;
    type: string;
    url?: string;
  };
}

export interface NewsSource {
  id: number;
  name: string;
  type: string;
  url?: string;
  description?: string;
}

export interface NewsTag {
  id: number;
  name: string;
}

export interface NewsFilter {
  tag?: string;
  source?: string;
  search?: string;
  page?: number;
  limit?: number;
}
