import { useNavigate } from 'react-router-dom';

const CastGrid = ({ cast }) => {
  const navigate = useNavigate();

  const handleCastMemberClick = (castMember) => {
    // Navigate to search page with actor filter pre-filled
    navigate('/search', { 
      state: { 
        prefillFilters: { 
          actor: castMember.person?.name || castMember 
        } 
      } 
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      {cast.map((member, index) => {
        // Handle both old format (string) and new format (object)
        const isObject = typeof member === 'object' && member !== null;
        const actorName = isObject ? member.person?.name : member;
        
        return (
          <button 
            key={member.id || index}
            onClick={() => handleCastMemberClick(member)}
            className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs transition-colors cursor-pointer text-white"
          >
            {actorName}
          </button>
        );
      })}
    </div>
  );
};

export default CastGrid;