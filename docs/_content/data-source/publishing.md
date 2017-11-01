---
title: How to Publish GrAMPS Data Sources
weight: 500
---

TKTK

### Add (or Remove) Code Climate

Since it’s free for open source repos, we strongly recommend taking advantage of Code Climate. We’ve already set up `.travis.yml` for you — all you have to do is:

1.  [Enable Code Climate on the repo][1]
2.  On codeclimate.com, open the repo, then click the Settings tab and choose 
    "Test coverage" from the left-hand menu
3.  Find your "test reporter ID" at the bottom of the test coverage settings

    ![Code Climate Test Reporter ID](https://d26dzxoao6i3hh.cloudfront.net/items/042W1d2I3c400T0o1M3M/%5B120d30aca5ca298f08f950b27b118737%5D_screencap-by-jlengstorf%2073.png)

4.  Copy the test reporter ID to the bottom of `.travis.yml` in the 
    `CC_TEST_REPORTER_ID` field:

    ```diff
      env:
          global:
    +     - CC_TEST_REPORTER_ID=498901dee0a2d339971e1bef0d73e3564e5362b33ad765b53cd60000092529ac6
    ```

> **NOTE:** If you don’t want to use Code Climate, delete the `before_script` 
> and `after_script` sections of `.travis.yml`.

> **IMPORTANT:** If you want your data source to be part of the official 
> [gramps-graphql org](https://github.com/gramps-graphql) and available under 
> the [`@gramps` scope in npm](https://www.npmjs.com/org/gramps), it _must_ be 
> configured to use Code Climate.

[1]: https://docs.codeclimate.com/v1.0/docs/open-source-free#section-adding-an-oss-github-repo-to-code-climate
