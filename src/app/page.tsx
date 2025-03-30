'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import NewsList from '@/components/NewsList';
import NewsFilters from '@/components/NewsFilters';
import { NewsItem, NewsFilter, NewsTag, NewsSource } from '@/types/news';

export default function HomePage() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [tags, setTags] = useState<NewsTag[]>([]);
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [filters, setFilters] = useState<NewsFilter>({ page: 1, limit: 12 });
  const [loading, setLoading] = useState(true);

  // Fetch filters data (tags and sources)
  useEffect(() => {
    async function fetchFiltersData() {
      try {
        const response = await fetch('/api/filters');
        const data = await response.json();
        
        if (data.success) {
          setTags(data.data.tags);
          setSources(data.data.sources);
        }
      } catch (error) {
        console.error('Error fetching filters data:', error);
      }
    }
    
    fetchFiltersData();
  }, []);

  // Fetch news with current filters
  useEffect(() => {
    async function fetchNews() {
      setLoading(true);
      
      try {
        // Build query string from filters
        const params = new URLSearchParams();
        if (filters.tag) params.append('tag', filters.tag);
        if (filters.source) params.append('source', filters.source);
        if (filters.search) params.append('search', filters.search);
        if (filters.page) params.append('page', filters.page.toString());
        if (filters.limit) params.append('limit', filters.limit.toString());
        
        const response = await fetch(`/api/news?${params.toString()}`);
        const data = await response.json();
        
        if (data.success) {
          setNews(data.news);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, [filters]);

  // Handle filter changes
  const handleFilterChange = (newFilters: NewsFilter) => {
    setFilters({ ...filters, ...newFilters, page: newFilters.page || 1 });
  };

  return (
    <Layout>
      <div className="px-4 sm:px-0">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">AI News Hub</h1>
          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Stay updated with the latest news about AI agents and technologies
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <NewsFilters
              tags={tags}
              sources={sources}
              onFilterChange={handleFilterChange}
              currentFilters={filters}
            />
          </div>
          
          <div className="lg:col-span-3">
            <NewsList news={news} loading={loading} />
            
            {/* Pagination */}
            {!loading && news.length > 0 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange({ page: Math.max(1, (filters.page || 1) - 1) })}
                    disabled={(filters.page || 1) <= 1}
                    className={`px-3 py-1 rounded-md ${
                      (filters.page || 1) <= 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Page {filters.page || 1}
                  </span>
                  <button
                    onClick={() => handleFilterChange({ page: (filters.page || 1) + 1 })}
                    disabled={news.length < (filters.limit || 12)}
                    className={`px-3 py-1 rounded-md ${
                      news.length < (filters.limit || 12)
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Next
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
