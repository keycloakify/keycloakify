<p align="center">
    <img src="https://user-images.githubusercontent.com/6702424/80216211-00ef5280-863e-11ea-81de-59f3a3d4b8e4.png">  
</p>
<p align="center">
    <i>Provides a way to customise Keycloak login and register pages with React</i>
    <br>
    <br>
    <img src="https://github.com/garronej/keycloak-react-theming/workflows/ci/badge.svg?branch=develop">
    <img src="https://img.shields.io/bundlephobia/minzip/keycloak-react-theming">
    <img src="https://img.shields.io/npm/dw/keycloak-react-theming">
    <img src="https://img.shields.io/npm/l/keycloak-react-theming">
</p>
<p align="center">
  <a href="https://github.com/garronej/keycloak-react-theming">Home</a>
  -
  <a href="https://github.com/garronej/keycloak-react-theming">Documentation</a>
</p>

# Install / Import

```bash
$ npm install --save keycloak-react-theming
```

```typescript
import { myFunction, myObject } from "keycloak-react-theming";
```

Specific imports:

```typescript
import { myFunction } from "keycloak-react-theming/myFunction";
import { myObject } from "keycloak-react-theming/myObject";
```

## Import from HTML, with CDN

Import it via a bundle that creates a global ( wider browser support ):

```html
<script src="//unpkg.com/keycloak-react-theming/bundle.min.js"></script>
<script>
    const { myFunction, myObject } = keycloak_react_theming;
</script>
```

Or import it as an ES module:

```html
<script type="module">
    import {
        myFunction,
        myObject,
    } from "//unpkg.com/keycloak-react-theming/zz_esm/index.js";
</script>
```

_You can specify the version you wish to import:_ [unpkg.com](https://unpkg.com)

## Contribute

```bash
npm install
npm run build
npm test
```
