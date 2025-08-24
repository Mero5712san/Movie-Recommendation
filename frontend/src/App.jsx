import { useState } from "react";
import MovieCarousel from "./components/MovieCarousel";
import HorizontalMovieList from "./components/HorizontalMovieList";
import SearchModal from "./components/SearchModal";
import { usePopularMovies, useRecommendations, useGenreMovies } from "./services/api";
import { SearchIcon } from "./assets/SearchIcon";

const App = () => {
  const topThree = usePopularMovies(3);
  const [searchOpen, setSearchOpen] = useState(false);
  const [randomUserId] = useState(() => Math.floor(Math.random() * 610) + 1);

  const recommendedMovies = useRecommendations(randomUserId, "Fluke");
  const popularMovies = usePopularMovies(10);

  const { movies: animatedMovies, loading: animatedLoading } = useGenreMovies("Animation");
  const { movies: horrorMovies, loading: horrorLoading } = useGenreMovies("Horror");
  const { movies: comedyMovies, loading: comedyLoading } = useGenreMovies("Comedy");
  const { movies: romanceMovies, loading: romanceLoading } = useGenreMovies("Romance");
  const { movies: adventureMovies, loading: adventureLoading } = useGenreMovies("Adventure");

  return (
    <div className="bg-gray-800 min-h-screen">
      {/* Topbar */}
      <div className="fixed top-0 left-0 w-full flex items-center justify-between p-2 bg-gray-900 shadow-md z-50 pr-8">
        <h1 className="text-xl font-bold text-white">Recommender</h1>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="p-2 bg-gray-700 rounded-full cursor-pointer hover:bg-gray-600" onClick={() => setSearchOpen(true)} >
            <SearchIcon className="w-6 h-6 text-white" />
          </div>

          <img
            src={`https://randomuser.me/api/portraits/men/${randomUserId % 100}.jpg`}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover cursor-pointer"
            onError={(e) => e.currentTarget.src = "https://via.placeholder.com/40x40.png?text=U"}
          />

        </div>
      </div>

      {/* Main content with top padding to prevent overlap */}
      <div className="p-4 pt-20 space-y-8">
        <MovieCarousel movies={topThree} />

        <HorizontalMovieList title="Recommended" movies={recommendedMovies} loading={recommendedMovies.length === 0} />
        <HorizontalMovieList title="Popular" movies={popularMovies} loading={popularMovies.length === 0} />
        <HorizontalMovieList title="Animated" movies={animatedMovies} loading={animatedLoading} />
        <HorizontalMovieList title="Horror" movies={horrorMovies} loading={horrorLoading} />
        <HorizontalMovieList title="Comedy" movies={comedyMovies} loading={comedyLoading} />
        <HorizontalMovieList title="Romance" movies={romanceMovies} loading={romanceLoading} />
        <HorizontalMovieList title="Adventure" movies={adventureMovies} loading={adventureLoading} />
      </div>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

    </div>
  );
};

export default App;
