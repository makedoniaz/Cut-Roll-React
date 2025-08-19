const CommentText = ({ text }) => {
  const formatText = (text) => {
    // Обработка @mentions
    return text.replace(/@(\w+)/g, '<span class="text-blue-400">@$1</span>');
  };

  return (
    <p 
      className="text-gray-300 leading-relaxed"
      dangerouslySetInnerHTML={{ __html: formatText(text) }}
    />
  );
};

export default CommentText;