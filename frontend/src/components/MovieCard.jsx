export const MovieCard = ({ name, image, score, year, duration, rating }) => {
  return (
    <div className="bg-[#111] text-white rounded-lg shadow-md overflow-hidden w-60 hover:scale-105 transition-transform duration-300 cursor-pointer flex-shrink-0">
      {/* Poster with Score */}
      <div className="relative w-full h-36 bg-gray-800 flex items-center justify-center">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />

        {/* Score Badge */}
        {score && (
          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-md shadow">
            ⭐ {parseFloat(score).toFixed(1)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="p-3">
        <h2 className="text-base font-semibold truncate">{name}</h2>

        <div className="text-sm text-gray-400 mt-1 flex items-center gap-2 flex-wrap">
          <span>{year}</span>
          {duration && <span>{duration}</span>}
          {rating && (
            <span className="border border-gray-500 rounded px-1 text-xs">
              {rating}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
