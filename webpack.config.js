module.exports = {
    entry: "./src/entry.js",
    output: {
        path: __dirname,
        filename: "assets/bundle.js"
    },
    module: {
        loaders: [
            { test: /\.css$/, loader: "style!css" }
        ]
    }
};
