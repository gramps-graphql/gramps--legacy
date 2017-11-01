// Rollup plugins
import eslint from 'rollup-plugin-eslint';
import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import uglify from 'rollup-plugin-uglify';

export default {
  entry: 'src/js/main.js',
  dest: 'assets/js/main.min.js',
  format: 'iife',
  sourceMap: true,
  plugins: [
    commonjs(),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    eslint({
      extends: 'airbnb-base',
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    uglify(),
  ],
};
