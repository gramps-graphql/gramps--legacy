const EOL = require('os').EOL;
const path = require('path');
const chalk = require('chalk');
const shell = require('shelljs');
const globby = require('globby');
const babel = require('babel-core');

const LIVE_DATA_ENV = 'live';
const MOCK_DATA_ENV = 'mock';

/**
 * Prints a notice to the console when using mock data sources.
 * @param  {string} srcDir  path to the data source directory
 * @param  {string} tmpDir  path to the temporary directory
 * @return {void}
 */
function printDevWarning(srcDir, tmpDir) {
  const message = [
    EOL,
    '======================= IMPORTANT ======================',
    '   Local data sources are for development only and',
    '   WILL NOT work in a live environment. For info on',
    '   putting your data source in production, see the',
    '   docs: https://ibm.biz/gramps-data-source-tutorial',
    '========================================================',
    EOL,
  ].join(EOL);

  shell.echo(chalk.red.bold(message));
  shell.echo(chalk.dim(`Source: ${srcDir}`));
  shell.echo(chalk.dim(`Compiled: ${tmpDir}${EOL}`));
}

/**
 * Creates an empty temporary directory and returns the path.
 * @param  {string} tmpDir  path to the temporary directory
 * @return {void}
 */
function makeTmpDir(tmpDir) {
  shell.echo(chalk.dim(' -> emptying the temporary directory...'));
  shell.rm('-rf', tmpDir);
  shell.mkdir(tmpDir);
  shell.echo(chalk.dim(' -> created an empty temporary directory'));
}

/**
 * Copies GraphQL files to a target directory.
 * @param  {string} fileGlob   file glob following globby patterns
 * @param  {string} targetDir  file glob following globby patterns
 * @return {void}
 */
function copyGQL(fileGlob, targetDir) {
  globby.sync(fileGlob).forEach(file => {
    shell.cp(file, targetDir);
    shell.echo(chalk.dim(` -> copied ${path.basename(file)}`));
  });
}

/**
 * Transpiles JavaScript files using Babel and saves them to a target directory.
 * @param  {string} fileGlob   file glob following globby patterns
 * @param  {string} targetDir  where to save transpiled files
 * @return {void}
 */
function transpileJS(fileGlob, targetDir) {
  globby.sync(fileGlob).forEach(file => {
    const fileName = path.basename(file);
    const tmpFile = path.join(targetDir, fileName);
    const transpiled = babel.transformFileSync(file);

    shell.touch(tmpFile);
    shell.ShellString(transpiled.code).to(tmpFile);
    shell.echo(chalk.dim(` -> transpiled ${fileName}`));
  });
}

/**
 * Creates a symlink to the `node_modules` folder so dependencies are available.
 * @param  {String} srcDir  the location of the source files
 * @param  {String} tmpDir  the location of the temporary data source files
 * @return {void}
 */
function symlinkNodeModules(srcDir, tmpDir) {
  shell.ln(
    '-s',
    path.join(srcDir, 'node_modules'),
    path.join(tmpDir, 'node_modules'),
  );
}

/**
 * Preps and saves a data source in a temp directory, and returns the temp path.
 * @param  {string} rootDir         GraphQL µ-service root directory
 * @param  {string} relativeSrcDir  relative path to a data source directory
 * @return {string}                 env var if set, otherwise an empty string
 */
function getDataSource(rootDir, relSrcDir) {
  if (!relSrcDir || !shell.test('-d', relSrcDir)) {
    if (relSrcDir) {
      shell.echo(chalk.red.bold(`Data source ${relSrcDir} does not exist.`));
    }

    return '';
  }

  const srcDir = path.join(process.cwd(), relSrcDir);
  const tmpDir = path.join(rootDir, '.tmp');

  shell.echo(`Loading ${srcDir}`);

  printDevWarning(srcDir, tmpDir);
  makeTmpDir(tmpDir);
  copyGQL(path.join(srcDir, '{src,}/*.graphql'), tmpDir);
  transpileJS(path.join(srcDir, '{src,}/*.js'), tmpDir);
  symlinkNodeModules(srcDir, tmpDir);

  shell.echo(chalk.bold(`${EOL}We’ve got ourselves a data source, folks. 🎉`));

  return tmpDir;
}

function getGrampsMode(isLive) {
  return isLive ? LIVE_DATA_ENV : MOCK_DATA_ENV;
}

module.exports = {
  getDataSource,
  getGrampsMode,
};
