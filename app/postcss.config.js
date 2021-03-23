module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
    "postcss-preset-env": {
      autoprefixer: {
        flexbox: 'no-2009',
      },
      stage: 3,
      features: {
        'custom-properties': false,
      },
    },
    // ...(process.env.NODE_ENV === "production"
    //   ? {
    //       "@fullhuman/postcss-purgecss": {
    //         content: ["./src/components/**/*.tsx", "./pages/**/*.tsx"],
    //         defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
    //       },
    //     }
    //   : {}),
  },
}
