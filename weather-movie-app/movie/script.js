
import { getMovieRating } from "./movieUtils.js";

const movieSearch = document.getElementById("movie-search");
const movieInput = document.getElementById("movie-input");
const searchMessage = document.getElementById("search-message");
const movieResults = document.getElementById("movie-results");

const apiKey = "cdac1cac";

movieSearch.addEventListener("submit", async (event) => {
    event.preventDefault();

    const movieName = movieInput.value.trim();

    if (!movieName) {
        searchMessage.textContent = "Please enter a movie name.";
        return;
    }

    searchMessage.textContent = "Searching for movies...";
    movieResults.innerHTML = "";

    try {
        const movieUrl = `https://www.omdbapi.com/?apikey=${apiKey}&s=${encodeURIComponent(movieName)}&type=movie`;

        const response = await fetch(movieUrl);

        if (!response.ok) {
            throw new Error("Unable to connect to the movie service.");
        }

        const movieData = await response.json();

        if (movieData.Response === "False") {
            throw new Error(
                movieData.Error === "Movie not found!"
                    ? "No movies found. Try another title."
                    : movieData.Error
            );
        }

        const { Search: movies } = movieData;

        const movieDetails = await Promise.all(
            movies.map(async (movie) => {
                try {
                    const detailsUrl = `https://www.omdbapi.com/?apikey=${apiKey}&i=${movie.imdbID}`;
                    const detailsResponse = await fetch(detailsUrl);

                    if (!detailsResponse.ok) {
                        return movie;
                    }

                    const details = await detailsResponse.json();

                    return details.Response === "True" ? details : movie;
                } catch {
                    return movie;
                }
            })
        );

        showMovies(movieDetails);
        searchMessage.textContent = "";

    } catch (error) {
        searchMessage.textContent =
            error.message || "Something went wrong. Please try again.";

        movieResults.innerHTML = "";
    }
});

function showMovies(movies) {
    movieResults.innerHTML = "";

    const movieList = document.createElement("div");
    movieList.className = "movie-list";

    movies.forEach((movie) => {
        const {
            Title: title,
            Year: year,
            Poster: poster,
            imdbRating: rating
        } = movie;

        const movieCard = document.createElement("article");
        movieCard.className = "movie-card";

        const movieInfo = document.createElement("div");
        movieInfo.className = "movie-info";

        const movieTitle = document.createElement("h2");
        movieTitle.textContent = title || "Title unavailable";

        const movieYear = document.createElement("p");
        movieYear.className = "movie-year";
        movieYear.textContent = `Released: ${year || "Unknown"}`;

        const movieRating = document.createElement("p");
        movieRating.className = "movie-rating";
        movieRating.textContent = getMovieRating(rating);

        if (poster && poster !== "N/A") {
            const moviePoster = document.createElement("img");

            moviePoster.className = "movie-poster";
            moviePoster.src = poster;
            moviePoster.alt = `${title || "Movie"} poster`;
            moviePoster.loading = "lazy";

            moviePoster.addEventListener("error", () => {
                const placeholder = document.createElement("div");
                placeholder.className = "poster-placeholder";
                placeholder.textContent = "Poster unavailable";
                moviePoster.replaceWith(placeholder);
            });

            movieCard.appendChild(moviePoster);
        } else {
            const placeholder = document.createElement("div");
            placeholder.className = "poster-placeholder";
            placeholder.textContent = "Poster unavailable";
            movieCard.appendChild(placeholder);
        }

        movieInfo.append(movieTitle, movieYear, movieRating);
        movieCard.appendChild(movieInfo);
        movieList.appendChild(movieCard);
    });

    movieResults.appendChild(movieList);
}
