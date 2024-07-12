const path = require('path');

module.exports = {
    mode: 'development',
    entry: ["./index.js", "./all-games-fronts/registers.js"],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
};
