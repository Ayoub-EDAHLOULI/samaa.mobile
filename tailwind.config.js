/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        samaa: {
          dark: "#0F172A", // Slate 900
          card: "#1E293B", // Slate 800
          blue: "#38BDF8", // Sky 400
          red: "#EF4444", // Red 500
          green: "#10B981", // Emerald 500
          text: "#F8FAFC", // Slate 50
          muted: "#94A3B8", // Slate 400
        },
      },
    },
  },
  plugins: [],
};
