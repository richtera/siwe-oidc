const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const dotenv = require('dotenv');
const path = require('path');
const sveltePreprocess = require('svelte-preprocess');
const webpack = require('webpack');

dotenv.config('./.env');
dotenv.config('../../.env');

const mode = process.env.NODE_ENV || 'development';
const prod = mode === 'production';

module.exports = {
	entry: {
		'build/bundle': ['./src/main.ts']
	},
	resolve: {
		alias: {
			svelte: path.dirname(require.resolve('svelte/package.json'))
		},
    conditionNames: ["svelte", "module", "browser", "default", "import"],
		extensions: ['.mjs', '.js', '.ts', '.svelte'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
		fallback: {
			assert: require.resolve("assert"),
			buffer: require.resolve('buffer/'),
			crypto: require.resolve('crypto-browserify'),
			fs: false,
			http: require.resolve('stream-http'),
			https: require.resolve('https-browserify'),
			os: require.resolve('os-browserify/browser'),
			path: false,
			process: require.resolve('process/browser'),
			stream: require.resolve('stream-browserify'),
			url: require.resolve("url")
			// util: false,
		}
	},
	output: {
		path: path.join(__dirname, '../../static'),
		filename: '[name].js',
		chunkFilename: '[name].[id].js'
	},
	module: {
		rules: [
			{
				test: /\.ts$/,
				loader: 'ts-loader',
				exclude: /node_modules/
			},
			{
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							dev: !prod
						},
						emitCss: prod,
						hotReload: !prod,
						preprocess: sveltePreprocess({
							sourceMap: !prod,
							postcss: true,
						}),
					}
				}
			},
			{
				test: /\.svg$/,
				use: [
					{
						loader: 'svg-url-loader',
						options: {
							limit: 10000,
						},
					},
				],
			},
			{
				test: /\.css$/,
				use: [
					MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
				// required to prevent errors from Svelte on Webpack 5+
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			}
		]
	},
	mode,
	plugins: [
		new webpack.ProvidePlugin({
			Buffer: ["buffer", "Buffer"],
			process: path.resolve(path.join(__dirname, "node_modules/process/browser")),
		}),
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
		new webpack.EnvironmentPlugin(prod ? ['INFURA_ID', 'PORTIS_ID', 'FORTMATIC_KEY'] : []),
	],
	devtool: prod ? false : 'source-map',
	devServer: {
		hot: true
	}
};
