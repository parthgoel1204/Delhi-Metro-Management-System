const path = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        path.join(__dirname, "./src/**/*.{html,js,ts,jsx,tsx}"),
        "./src/**/*.{html,js,ts,jsx,tsx}"
    ],
    darkMode: 'class', // Enable dark mode with 'dark' class
    theme: {
        extend: {
            colors: {
                dmrc: {
                    navy: '#1A365D',     // Deep Navy
                    cobalt: '#2B6CB0',   // Bright Cobalt for active
                    surface: '#F8FAFC',  // Light Mode Surface
                    dark: '#0F172A',     // Dark Mode Surface
                    success: '#059669',  // Cleaned Status
                }
            },
            fontFamily: {
                sans: ['Inter', 'Roboto', 'sans-serif'],
            },
        },
    },
    plugins: [],
}
