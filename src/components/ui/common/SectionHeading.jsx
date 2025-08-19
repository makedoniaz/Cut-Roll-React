const SectionHeading = ({ heading }) => {
    return ( 
        <div>
            <div className="flex justify-between items-center">
                <h2 className="text-base font-medium text-gray-400 tracking-wider">{heading}</h2>
                <button 
                    className="cursor-pointer font-medium text-gray-400 hover:text-green-500"
                >
                        MORE
                </button>
            </div>
            <hr className="border-t border-gray-700 my-4 mb-8" />
        </div>
    );
}
 
export default SectionHeading;