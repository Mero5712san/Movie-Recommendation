import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function MovieCarousel({ movies }) {
    const [index, setIndex] = useState(0);

    // Auto-slide every 4 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % movies.length);
        }, 4000);
        return () => clearInterval(interval);
    }, [movies.length]);

    if (!movies || movies.length === 0) return null;

    return (
        <div className="relative w-full h-96 overflow-hidden rounded-md">
            {/* Slides container */}
            <motion.div
                className="flex w-full h-full"
                animate={{ x: `-${index * 100}%` }}
                transition={{ type: "tween", duration: 0.8 }}
            >
                {movies.map((movie) => (
                    <div
                        key={movie.id || movie.rank} // fallback if id is missing
                        className="w-full h-full flex-shrink-0 bg-cover bg-center flex items-end justify-center"
                        style={{ backgroundImage: `url(${movie.banner || movie.image})` }}
                    >
                        <div className="bg-black/40 p-6 rounded-lg mb-20 text-center">
                            <h2 className="text-white text-[38px] font-bold">
                                {movie.title}
                            </h2>
                            <p className="text-gray-300 text-lg">{movie.year || "N/A"}</p>
                        </div>
                    </div>
                ))}
            </motion.div>

            {/* Carousel Dots */}
            <div className="absolute bottom-6 w-full flex justify-center gap-3">
                {movies.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setIndex(i)}
                        className={`w-4 h-4 rounded-full ${i === index ? "bg-white" : "bg-gray-500"
                            }`}
                    ></button>
                ))}
            </div>
        </div>
    );
}
