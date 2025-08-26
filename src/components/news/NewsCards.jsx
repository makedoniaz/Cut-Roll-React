import { memo } from 'react';
import NewsCard from "./NewsCard";

const NewsCards = memo(({ 
    news, 
    showAuthor, 
    showActions,
    onNewsDeleted
}) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {news.slice(0, 6).map((article) => (
                       <NewsCard
                           key={article.id}
                           article={article}
                           showAuthor={showAuthor}
                           showActions={showActions}
                           onNewsDeleted={onNewsDeleted}
                       />
                   ))}
        </div>
    );
});

NewsCards.displayName = 'NewsCards';

export default NewsCards;
