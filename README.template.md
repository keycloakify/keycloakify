<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/80216211-00ef5280-863e-11ea-81de-59f3a3d4b8e4.png">  
</p>
<p align="center">
    <i>#{DESC}#</i>
    <br>
    <br>
    <img src="https://github.com/garronej/#{REPO_NAME}#/workflows/ci/badge.svg?branch=develop">
    <img src="https://img.shields.io/bundlephobia/minzip/#{REPO_NAME}#">
    <img src="https://img.shields.io/npm/dw/#{REPO_NAME}#">
    <img src="https://img.shields.io/npm/l/#{REPO_NAME}#">
</p>
<p align="center">
  <a href="https://github.com/#{USER_OR_ORG}#/#{REPO_NAME}#">Home</a>
  -
  <a href="https://github.com/#{USER_OR_ORG}#/#{REPO_NAME}#">Documentation</a>
</p>

# Install / Import

```bash
$ npm install --save #{REPO_NAME}#
```

```typescript
import { myFunction, myObject } from "#{REPO_NAME}#";
```

Specific imports:

```typescript
import { myFunction } from "#{REPO_NAME}#/myFunction";
import { myObject } from "#{REPO_NAME}#/myObject";
```

## Import from HTML, with CDN

Import it via a bundle that creates a global ( wider browser support ):

```html
<script src="//unpkg.com/#{REPO_NAME}#/bundle.min.js"></script>
<script>
    const { myFunction, myObject } = #{REPO_NAME_NO_DASHES}#;
</script>
```

Or import it as an ES module:

```html
<script type="module">
    import {
        myFunction,
        myObject,
    } from "//unpkg.com/#{REPO_NAME}#/zz_esm/index.js";
</script>
```

_You can specify the version you wish to import:_ [unpkg.com](https://unpkg.com)

## Contribute

```bash
npm install
npm run build
npm test
```
