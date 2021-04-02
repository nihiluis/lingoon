const DEV = process.env.NODE_ENV !== "production"
module.exports = {
  basePath: DEV ? "" : "/inventory-app",
  node: {
    fs: "empty",
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"]
    })

    return config;
  }
}
