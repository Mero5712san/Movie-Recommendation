import { useRef } from "react";
import { MovieCard } from "./MovieCard";
import { ArrowIconRight } from "../assets/ArrowIconRight";

export default function HorizontalMovieList({ title, movies, loading }) {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        if (!scrollRef.current) return;
        const scrollAmount = scrollRef.current.offsetWidth; // scroll width
        scrollRef.current.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
    };

    return (
        <div className="space-y-2 scrollbar-hide">
            <h2 className="text-2xl font-bold text-white">{title}</h2>
            <div className="relative">
                {/* Left arrow */}
                <button
                    onClick={() => scroll(-1)}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70 rotate-180"
                >
                    <ArrowIconRight />
                </button>

                {/* Right arrow */}
                <button
                    onClick={() => scroll(1)}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-black/50 p-2 rounded-full hover:bg-black/70"
                >
                    <ArrowIconRight/>
                </button>

                {/* Movie cards container */}
                <div
                    ref={scrollRef}
                    className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth px-10 py-2"
                >
                    {loading
                        ? Array.from({ length: 5 }).map((_, idx) => (
                            <div
                                key={idx}
                                className="w-40 h-60 bg-gray-300 animate-pulse rounded-md"
                            ></div>
                        ))
                        : movies.map((movie) => <MovieCard key={movie.id || movie.rank || movie.title} {...movie} />)}
                </div>
            </div>
        </div>
    );
}
