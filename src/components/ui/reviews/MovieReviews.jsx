import { useState } from 'react'
import ReviewCard from './ReviewCard';
import SectionHeading from '../common/SectionHeading';

const MovieReviews = ({ heading }) => {
  const [reviews] = useState([
    {
      id: 1,
      username: "jonathan fujii",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      rating: 3,
      comments: 34,
      text: "Vanessa Kirby fighting for her life for two hours while bro is tryna solve equations",
      likes: 15699
    },
    {
      id: 2,
      username: "allain♡",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=100&h=100&fit=crop&crop=face",
      rating: 0,
      comments: 1,
      text: "it took 14 years, but Renesmee has finally met a worthy CGI opponent",
      likes: 15842
    },
    {
      id: 3,
      username: "matt lynch",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      rating: 3,
      comments: null,
      text: "Not bad. Or you could just watch THE INCREDIBLES again.",
      likes: 14850
    }
  ]);

  return (
    <div className="bg-gray-900 mb-12">
      <div className="max-w-4xl mx-auto">
        <SectionHeading heading={heading} />
        <div className="rounded-lg">
          <div className="">
            {reviews.map((review, index) => (
              <ReviewCard 
                key={review.id} 
                review={review}
                isFirst={index === 0}
                isLast={index === reviews.length - 1}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieReviews;