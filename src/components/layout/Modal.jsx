import { useEffect } from "react";
import { X} from "lucide-react";

function Modal({ isOpen, onClose, children, size = "default", allowOverflow = false }) {
  // Disable body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store the current scroll position
      const scrollY = window.scrollY;
      
      // Disable scroll
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      // Cleanup function to re-enable scroll
      return () => {
        // Re-enable scroll
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        
        // Restore scroll position
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Define size variants
  const sizeClasses = {
    default: "max-w-4xl",
    large: "max-w-6xl",
    full: "max-w-[90vw]"
  };

  // Define height and overflow behavior
  const heightClasses = allowOverflow 
    ? "max-h-[90vh]" 
    : "max-h-[95vh] overflow-y-auto";

  const contentClasses = allowOverflow
    ? "" // No overflow constraint on content when allowing overflow
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className={`relative bg-gray-800 rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 ${heightClasses}`}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors z-10"
        >
          <X className="h-5 w-5" />
        </button>
        
        <div className={`p-6 ${contentClasses}`}>
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;