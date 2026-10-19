import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';

/** Palette taken from the school crest: navy border, crest blue field, white book. */
/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.tsx',
    ],

    theme: {
        extend: {
            colors: {
                navy: { 50: '#f0f4f9', 100: '#dce5f0', 200: '#b9c9de', 300: '#8ea7c6', 700: '#1b3a66', 800: '#142d52', 900: '#0d2140', 950: '#08162c' },
                crest: { 50: '#f2f7fc', 100: '#e3eef8', 200: '#c8ddf0', 300: '#a6c6e6', 400: '#7ea8d3', 600: '#3d6fa6', 700: '#2d5a8c' },
                brass: '#a8864f',
                paper: '#f9f7f2',
                rule: '#e3ded2',
            },
            fontFamily: {
                sans: ['"Source Sans 3"', ...defaultTheme.fontFamily.sans],
                serif: ['"Cormorant Garamond"', 'Garamond', 'Georgia', ...defaultTheme.fontFamily.serif],
            },
            maxWidth: { site: '78rem' },
        },
    },

    plugins: [forms, typography],
};
