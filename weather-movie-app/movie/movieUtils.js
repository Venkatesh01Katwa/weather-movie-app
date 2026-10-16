
export function getMovieRating(rating) {
    if (!rating || rating === "N/A") {
        return "IMDb rating unavailable";
    }

    return `IMDb: ${rating}/10`;
}
