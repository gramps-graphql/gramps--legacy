---
title: CLI API Docs
---

For the most concise docs, run:

```bash
gramps <command> --help
```

## Available Commands
{:.no_toc}

- 
{:toc}

## `gramps dev`

Start a gateway (server) for development.

### Usage
{:.no_toc}

```
$ gramps dev [options]
```

### Options
{:.no_toc}

 -  `--data-source <path> [path..]` (aliases: `--data-sources`, `-d`)

    Optional flag to specify which data source(s) to run locally for development. GrAMPS will look in the provided directory’s root and `src` directory for data source files.

    ```bash
    # Run the default development gateway with a single data source
    gramps dev --data-source ./data-source-one

    # Run the default development gateway with two data sources
    gramps dev --data-sources ./data-source-one ./data-source-two

    # Run the default development gateway with two data sources use shorthand
    gramps dev -d ./data-source-one ./data-source-two
    ```

    > **NOTE:** Unless the `--no-transpile` flag is set, the data source files will be transpiled using Babel with [GrAMPS default settings](https://github.com/gramps-graphql/gramps-cli/blob/master/.babelrc).

    <br>

 -  `--gateway <path>` (alias: `-g`)
    
    Optional flag to specify a custom gateway for development. This gateway is _not_ transpiled, so point to your build folder if your code requires transpilation.

    ```bash
    # Run a custom gateway
    gramps dev --gateway ./gateway.js

    # Run a custom gateway plus a local data source
    gramps dev --gateway ./gateway.js --data-source ./data-source-one
    ```

    <br>

 -  `--mock`
    
    Optional flag to enable [data mocking](https://www.apollographql.com/docs/graphql-tools/mocking.html).

    This option has an opposite — `--live` — which is enabled by default and is therefore never necessary to set explicitly. However, it can be useful if you want to be very clear about what kind of data is being used.

    ```bash
    # Run the default development gateway in mock mode
    gramps dev --mock

    # Run a custom gateway in mock mode
    gramps dev -g ./gateway.js --mock

    # Explicitly run a custom gateway in live mode
    gramps dev -g ./gateway.js --live
    ```

    <br>

 -  `--no-transpile`

    An optional flag to disable transpilation of data sources via Babel. If this is set, the data source path needs to point to code that is already built and/or does not require transpilation to run properly.

    ```bash
    # Run the default development gateway with an untranspiled data source
    gramps dev -d ./data-source-one --no-transpile
    ```

    This option has an opposite — `--transpile` — but this is enabled by default and therefore is never required to be set explicitly.
