import { useState } from "react";
import { useSearchMovies } from "../services/api";
import { MovieCard } from "./MovieCard";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { CloseIcon } from "../assets/CloseIcon";

const SearchModal = ({ isOpen, onClose }) => {
    const [query, setQuery] = useState("");
    const [genre, setGenre] = useState("");

    const { movies, loading } = useSearchMovies(query, genre, 50);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Background dim */}
                    <motion.div
                        className="fixed inset-0 bg-black/50 z-40"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Modal container */}
                    <motion.div
                        className="fixed inset-0 z-50 flex flex-col"
                        initial={{ y: "-100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "-100%" }}
                        transition={{ type: "spring", stiffness: 120, damping: 20 }}
                    >
                        {/* Input Section (fixed) */}
                        <div className="p-8 bg-gray-900 flex flex-wrap gap-4 items-center">
                            <input
                                type="text"
                                placeholder="Search by movie name"
                                className="flex-1 p-3 rounded-md bg-gray-800 text-white outline-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Search by genre"
                                className="flex-1 p-3 rounded-md bg-gray-800 text-white outline-none"
                                value={genre}
                                onChange={(e) => setGenre(e.target.value)}
                            />
                            <button
                                className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-md"
                                onClick={() => { }}
                            >
                                Search
                            </button>
                            <button className="p-1" onClick={onClose}>
                                <CloseIcon />
                            </button>
                        </div>

                        {/* Results Section (scrollable) */}
                        <div className="flex-1 bg-gray-900 p-8 overflow-y-auto scrollbar-hide">
                            {loading ? (
                                <p className="text-white">Loading...</p>
                            ) : (
                                <div className="grid grid-cols-5 gap-4">
                                    {movies.map((movie) => (
                                        <MovieCard key={movie.id || movie.title} {...movie} />
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;
