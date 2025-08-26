import NewsCards from "./NewsCards";
import SectionHeaderWithTabs from '../ui/common/SectionHeaderWithTabs';

const NewsGrid = ({
    news, 
    heading, 
    tabs = [],
    activeTab = null,
    onTabChange = () => {},
    onMoreClick = () => {},
    showAuthor = true,
    showActions = false,
    onNewsDeleted = () => {}
}) => {
    return ( 
        <div className="py-2">
            <div className="max-w-7xl mx-auto">
                <SectionHeaderWithTabs 
                    heading={heading}
                    tabs={tabs}
                    activeTab={activeTab}
                    onTabChange={onTabChange}
                    onMoreClick={onMoreClick}
                />
                <div>
                    <NewsCards 
                        news={news}
                        showAuthor={showAuthor}
                        showActions={showActions}
                        onNewsDeleted={onNewsDeleted}
                    />
                </div>
            </div>
        </div>
    );
}
 
export default NewsGrid;
