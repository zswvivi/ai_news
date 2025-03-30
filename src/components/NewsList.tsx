import { NewsItem } from '@/types/news';
import NewsCard from './NewsCard';

type NewsListProps = {
  news: NewsItem[];
  loading?: boolean;
};

export default function NewsList({ news, loading = false }: NewsListProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-md h-80 animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300">No news articles found</h3>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your filters or check back later</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}
