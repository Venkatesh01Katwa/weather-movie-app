
const citySearch = document.getElementById("city-search");
const cityInput = document.getElementById("city-input");
const message = document.getElementById("message");
const weatherDetails = document.getElementById("weather-details");

const cityName = document.getElementById("city-name");
const weatherCondition = document.getElementById("weather-condition");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("wind-speed");

const weatherDescriptions = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Foggy",
    48: "Foggy",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Heavy drizzle",
    61: "Light rain",
    63: "Moderate rain",
    65: "Heavy rain",
    71: "Light snowfall",
    73: "Moderate snowfall",
    75: "Heavy snowfall",
    80: "Rain showers",
    81: "Moderate rain showers",
    82: "Heavy rain showers",
    95: "Thunderstorm",
    96: "Thunderstorm with hail",
    99: "Thunderstorm with heavy hail"
};

citySearch.addEventListener("submit", async function (event) {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        message.textContent = "Please enter a city name.";
        weatherDetails.hidden = true;
        return;
    }

    message.textContent = "Checking the weather...";
    weatherDetails.hidden = true;

    try {
        const cityUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`;

        const cityResponse = await fetch(cityUrl);

        if (!cityResponse.ok) {
            throw new Error("Unable to search for this city.");
        }

        const cityData = await cityResponse.json();

        if (!cityData.results || cityData.results.length === 0) {
            throw new Error("City not found. Please check the spelling.");
        }

        const selectedCity = cityData.results[0];

        const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${selectedCity.latitude}&longitude=${selectedCity.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`;

        const weatherResponse = await fetch(weatherUrl);

        if (!weatherResponse.ok) {
            throw new Error("Unable to get weather information. Try again.");
        }

        const weatherData = await weatherResponse.json();
        const currentWeather = weatherData.current;

        if (!currentWeather) {
            throw new Error("Weather information is currently unavailable.");
        }

        cityName.textContent = `${selectedCity.name}, ${selectedCity.country}`;
        weatherCondition.textContent =
            weatherDescriptions[currentWeather.weather_code] || "Conditions unavailable";
        temperature.textContent = `${Math.round(currentWeather.temperature_2m)}°C`;
        humidity.textContent = `${currentWeather.relative_humidity_2m}%`;
        windSpeed.textContent = `${currentWeather.wind_speed_10m} km/h`;

        message.textContent = "";
        weatherDetails.hidden = false;

    } catch (error) {
        message.textContent = error.message || "Something went wrong. Please try again.";
        weatherDetails.hidden = true;
    }
});
