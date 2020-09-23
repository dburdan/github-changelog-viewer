import webpack from 'webpack';
import CopyPlugin from 'copy-webpack-plugin';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import ZipFilesPlugin from 'webpack-zip-files-plugin';
import path from 'path';
import {
  name as libraryName,
  version as libVersion,
  license as license,
} from './package.json';


const libBanner = `${libraryName} - v${libVersion}\n
URL - https://github.com/dburdan/github-changelog-viewer\n
${license} License, Copyright Dacri Burdan ${(new Date()).getFullYear()}`

const destination = path.resolve(__dirname, 'dist');

const addPlugins = (argv: webpack.CliConfigOptions) => {
  const plugins = [
    new webpack.BannerPlugin({
      banner: libBanner,
      entryOnly: true,
    }),

    new CleanWebpackPlugin({
      cleanOnceBeforeBuildPatterns: [
        destination,
        path.resolve(__dirname, libraryName),
        path.resolve(__dirname, `${libraryName}.zip`),
      ],
    }),

    new CopyPlugin({
      patterns: [
        { from: 'src/html', to: destination },
        { from: 'manifest.json', to: destination },
        { from: 'LICENSE', to: destination },
        { from: 'images/icon-*.png', to: destination },
      ],
      options: {},
    }),

    ...(argv.mode === 'production' ? [
      new ZipFilesPlugin({
        entries: [{ src: destination, dist: '/github-changelog-viewer' }],
        output: path.resolve(__dirname, `builds/${libraryName}-${libVersion}`),
        format: 'zip',
      }),
    ] : []),
  ];

  return plugins;
}


const config: webpack.ConfigurationFactory = (_env, argv) => {
  return {
    entry: {
      inject: './src/inject.ts',
      background: './src/background.ts',
    },
    devtool: 'cheap-module-source-map',
    mode: argv.mode,
    resolve: {
      extensions: ['.ts'],
    },
    output: {
      path: destination,
      filename: '[name].js',
      library: libraryName,
      libraryTarget: 'global'
    },
    module: {
      rules: [
        {
          test: /\.ts$/,
          exclude: /node_modules|dist/,
          use: {
            loader: 'babel-loader'
          }
        }
      ]
    },
    plugins: addPlugins(argv),
    watchOptions: {
      poll: true,
      ignored: /node_modules/
    }
  };
};

export default config;
