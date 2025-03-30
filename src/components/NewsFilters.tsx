import { NewsFilter } from '@/types/news';
import { useState } from 'react';

type NewsFiltersProps = {
  tags: { id: number; name: string }[];
  sources: { id: number; name: string }[];
  onFilterChange: (filters: NewsFilter) => void;
  currentFilters: NewsFilter;
};

export default function NewsFilters({ 
  tags, 
  sources, 
  onFilterChange, 
  currentFilters 
}: NewsFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(currentFilters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...currentFilters, search: searchTerm });
  };

  const handleTagClick = (tagName: string) => {
    onFilterChange({ 
      ...currentFilters, 
      tag: currentFilters.tag === tagName ? undefined : tagName 
    });
  };

  const handleSourceClick = (sourceName: string) => {
    onFilterChange({ 
      ...currentFilters, 
      source: currentFilters.source === sourceName ? undefined : sourceName 
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Filters</h2>
      
      {/* Search */}
      <div className="mb-4">
        <form onSubmit={handleSearchSubmit}>
          <div className="relative">
            <input
              type="text"
              className="w-full pl-3 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Search news..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button
              type="submit"
              className="absolute inset-y-0 right-0 px-3 flex items-center"
            >
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
      
      {/* Tags */}
      <div className="mb-4">
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Topics</h3>
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => handleTagClick(tag.name)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                currentFilters.tag === tag.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Sources */}
      <div>
        <h3 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Sources</h3>
        <div className="flex flex-wrap gap-2">
          {sources.map((source) => (
            <button
              key={source.id}
              onClick={() => handleSourceClick(source.name)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                currentFilters.source === source.name
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {source.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Clear filters */}
      {(currentFilters.tag || currentFilters.source || currentFilters.search) && (
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => onFilterChange({ page: 1 })}
            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
