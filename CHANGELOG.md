# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0](https://github.com/hashi-at-home/cdevents-adapter/compare/v2.1.0...v3.0.0) (2026-03-26)

### ⚠ BREAKING CHANGES

* add initial implementation of jira adapter

### ✨ Features

* add initial implementation of jira adapter ([4ecb68c](https://github.com/hashi-at-home/cdevents-adapter/commit/4ecb68cbbb7cafdaf612553b93282972e19d84af))

### 🐛 Bug Fixes

* **deps:** update dependency @hono/swagger-ui to ^0.6.0 ([e7aed55](https://github.com/hashi-at-home/cdevents-adapter/commit/e7aed55ed933c5c99d0b7823392191a8d74795e3))
* **github:** allow any string for action ([2fb1258](https://github.com/hashi-at-home/cdevents-adapter/commit/2fb1258dbb56ff4552f211d2f667806b9c22c2db))
* **spec:** change context version key to specVersion ([7492fd6](https://github.com/hashi-at-home/cdevents-adapter/commit/7492fd66cd25d76fe88384d61978387240134781))
* **spec:** change context version key to specVersion ([e6fc07f](https://github.com/hashi-at-home/cdevents-adapter/commit/e6fc07f8b2b7e7efadb64eddf67e4f2f32694e7e))

### 📚 Documentation

* **readme:** update design philosophy in README ([055495e](https://github.com/hashi-at-home/cdevents-adapter/commit/055495e64d78b602aa22b4f0c24067c2d084e930))

### ♻️ Code Refactoring

* **validation:** add helper function and related tests to validate generated events ([696f16a](https://github.com/hashi-at-home/cdevents-adapter/commit/696f16a1ad731ea8bd43a1d7485902d3ccd849bb))

### ✅ Tests

* add  essential test suite ([ece28b9](https://github.com/hashi-at-home/cdevents-adapter/commit/ece28b9b9863f5b03dbdcdc1b56c22872925c704))
* **github:** fix tests to expect correct output on github events ([cc61955](https://github.com/hashi-at-home/cdevents-adapter/commit/cc61955170a69080fc5dca2d9b5f6a7619abd92b))
* **servers:** expect at least the development server to be specified ([91b1af9](https://github.com/hashi-at-home/cdevents-adapter/commit/91b1af916ff526f837ac8f80fdf9e90d55b96cf2))
* **tags:** add mising Jira Adapter tag ([6ed1ef1](https://github.com/hashi-at-home/cdevents-adapter/commit/6ed1ef1f964e159c327d0a2639de04b996356dbd))

### 📦 Build System

* **deps:** update dependencies ([1a232e2](https://github.com/hashi-at-home/cdevents-adapter/commit/1a232e21de9b115da7ae23dce2480fe702a52cfe))
* update node version and move from pre-commit to prek ([2434ed4](https://github.com/hashi-at-home/cdevents-adapter/commit/2434ed49337d349bcdc3be6b3ff3bec4745b801e))

### 🔧 Chores

* add cloudflare binding configuraiton ([8af6dd1](https://github.com/hashi-at-home/cdevents-adapter/commit/8af6dd10520a0fbc6fe2de06c0cea5d84635548b))
* add cloudflare types ([af16839](https://github.com/hashi-at-home/cdevents-adapter/commit/af16839286c9205d8a94348bf76e58d9282f8f70))
* **deps:** update actions/cache action to v5 ([a27afb5](https://github.com/hashi-at-home/cdevents-adapter/commit/a27afb53fdf69f9299c724305a2331bd872cb828))
* **deps:** update actions/cache action to v5.0.3 ([ce06b38](https://github.com/hashi-at-home/cdevents-adapter/commit/ce06b383c6a635008b81a53a0a61b48724367e43))
* **deps:** update actions/cache action to v5.0.4 ([75993ce](https://github.com/hashi-at-home/cdevents-adapter/commit/75993ce3f7b73b38791cd22d7e5227f00638f9c6))
* **deps:** update actions/checkout action to v6 ([5c66a71](https://github.com/hashi-at-home/cdevents-adapter/commit/5c66a71da7004721b62d1eb3efe84ec9b0a4cd84))
* **deps:** update actions/upload-artifact action to v6 ([4f8b36f](https://github.com/hashi-at-home/cdevents-adapter/commit/4f8b36f2da45dd9d6c59997d76b596e8f87e7c9c))
* **deps:** update actions/upload-artifact action to v7 ([529cb87](https://github.com/hashi-at-home/cdevents-adapter/commit/529cb87e8bc382b5800129cb01d6cf19a5a3dc09))
* **deps:** update dependency @cloudflare/vite-plugin to v1.19.0 ([32179d0](https://github.com/hashi-at-home/cdevents-adapter/commit/32179d0b5ec9eefe79767e81187f3eed324acc14))
* **deps:** update dependency @cloudflare/vite-plugin to v1.24.0 ([ecfa889](https://github.com/hashi-at-home/cdevents-adapter/commit/ecfa889f2916ed813ab9e902cff403e8b6cbadd6))
* **deps:** update dependency @cloudflare/vite-plugin to v1.29.1 ([7209e26](https://github.com/hashi-at-home/cdevents-adapter/commit/7209e26baf1c92f681675727c8bf727da9878540))
* **deps:** update dependency @hono/swagger-ui to v0.5.3 ([9d2a5a8](https://github.com/hashi-at-home/cdevents-adapter/commit/9d2a5a84e9bf6c0fc10a4bc328d5fdfa0ef0000c))
* **deps:** update dependency @hono/zod-openapi to v1.2.0 ([d863318](https://github.com/hashi-at-home/cdevents-adapter/commit/d863318a7dd9a88a24ce48ece60b14f36868507e))
* **deps:** update dependency @hono/zod-openapi to v1.2.2 ([ba63d23](https://github.com/hashi-at-home/cdevents-adapter/commit/ba63d23e03da895ef3b2a3ec885432c421c20978))
* **deps:** update dependency @types/node to v24.10.13 ([16ff3ce](https://github.com/hashi-at-home/cdevents-adapter/commit/16ff3ce520caa970acec40e49b3393290953865c))
* **deps:** update dependency @types/node to v24.10.4 ([6357c8c](https://github.com/hashi-at-home/cdevents-adapter/commit/6357c8cfb2714dced8bd3d80a0a22023d9810ae7))
* **deps:** update dependency @types/node to v24.12.0 ([cd78bbf](https://github.com/hashi-at-home/cdevents-adapter/commit/cd78bbff9674212e7e8f02af3eb488023eeb289f))
* **deps:** update dependency conventional-changelog-conventionalcommits to v9 ([ed175d6](https://github.com/hashi-at-home/cdevents-adapter/commit/ed175d61d62090072bd2c4c3f0e080ada87ebbba))
* **deps:** update dependency conventional-changelog-conventionalcommits to v9.3.0 ([9ca2eb3](https://github.com/hashi-at-home/cdevents-adapter/commit/9ca2eb349ecbbfb051bcd3d76a6e509efba4f9a4))
* **deps:** update dependency hono to v4.11.3 ([84cdd2a](https://github.com/hashi-at-home/cdevents-adapter/commit/84cdd2a3e6726fcabee0d3a241ac08a450ad4dc2))
* **deps:** update dependency hono to v4.11.9 ([3273f6e](https://github.com/hashi-at-home/cdevents-adapter/commit/3273f6e267f79a554e44d2f794bc1a6d6dfa8763))
* **deps:** update dependency hono to v4.12.7 [security] ([fd74981](https://github.com/hashi-at-home/cdevents-adapter/commit/fd74981767a8e5919784b9f2b481769307f70fa0))
* **deps:** update dependency hono to v4.12.8 ([fc41488](https://github.com/hashi-at-home/cdevents-adapter/commit/fc4148809e67718bc0cac9385e847cdf0f3ce4f3))
* **deps:** update dependency node to v24.12.0 ([782aa48](https://github.com/hashi-at-home/cdevents-adapter/commit/782aa4865a4d6715e576ed49bc3b59684cfdbb6d))
* **deps:** update dependency node to v24.13.1 ([cdc2f66](https://github.com/hashi-at-home/cdevents-adapter/commit/cdc2f6663901c6af3f35362bd31d5d1efcdf2304))
* **deps:** update dependency python to v3.14.3 ([ef363d1](https://github.com/hashi-at-home/cdevents-adapter/commit/ef363d1799a314ef4af9c697870c351490652638))
* **deps:** update dependency vite to v7.3.0 ([4013e18](https://github.com/hashi-at-home/cdevents-adapter/commit/4013e186151431ca25b09c9bd1d454328b002289))
* **deps:** update dependency vite to v8 ([d67d353](https://github.com/hashi-at-home/cdevents-adapter/commit/d67d353585e89710ed203b2f18065a7aa93e84be))
* **deps:** update dependency vite-ssr-components to v0.5.2 ([769c0f7](https://github.com/hashi-at-home/cdevents-adapter/commit/769c0f78cd1556721345299aaffc5412a910a3f3))
* **deps:** update dependency vitest to v4.0.16 ([127de47](https://github.com/hashi-at-home/cdevents-adapter/commit/127de471365ad3204cf9923d555ddcead44d7b4c))
* **deps:** update dependency wrangler to v4.75.0 ([f5a1049](https://github.com/hashi-at-home/cdevents-adapter/commit/f5a10499a8ecffda3a0377a0574ebfa7e4da1640))
* **deps:** update node.js to v24.14.0 ([8ab69a4](https://github.com/hashi-at-home/cdevents-adapter/commit/8ab69a4d1bf7e53b9f86f9be184fe9c514304ac3))
* **deps:** update node.js to v24.14.1 ([163bd96](https://github.com/hashi-at-home/cdevents-adapter/commit/163bd963b92f064309e5bcf1cb22474fc7ffb029))
* **deps:** update semantic-release monorepo ([4444f8c](https://github.com/hashi-at-home/cdevents-adapter/commit/4444f8cbe52335a601318b903707432c46e424b0))
* **deps:** update semantic-release monorepo ([0d81aae](https://github.com/hashi-at-home/cdevents-adapter/commit/0d81aae42ecfed720cadde3ef6d0fe3add814610))
* update lockfile ([98c7011](https://github.com/hashi-at-home/cdevents-adapter/commit/98c70117e7c56b387cc2e6c3ebedceb01675b991))
* update node packages ([48d4884](https://github.com/hashi-at-home/cdevents-adapter/commit/48d48847c00d858977dec7d32dc157fe399b3a4b))
* update package dependencies ([42434fa](https://github.com/hashi-at-home/cdevents-adapter/commit/42434fa1ca4c72321abc1873c05fc041e2744b14))
* update semantic-release dependencies ([2fd2d2c](https://github.com/hashi-at-home/cdevents-adapter/commit/2fd2d2c489bb635a88acd2a0ba8f5c9a1bde359e))

## [2.1.0](https://github.com/hashi-at-home/cdevents-adapter/compare/v2.0.1...v2.1.0) (2025-12-27)


### ✨ Features

* add / and /webhook routes, with processing implementation ([b54d405](https://github.com/hashi-at-home/cdevents-adapter/commit/b54d4053c7947f167ff1ae0a305d337ff358e573))
* log webhooks to r2 ([56f4dbd](https://github.com/hashi-at-home/cdevents-adapter/commit/56f4dbd79e565f0b5ca00f201b42c44bc5285b88))


### 🐛 Bug Fixes

* contacts ([9549475](https://github.com/hashi-at-home/cdevents-adapter/commit/95494755d51e9ee8b659c1faa35a49b1d9018d04))


### ✅ Tests

* update test to pass on semantic versions instead of hard-coded ([b352f20](https://github.com/hashi-at-home/cdevents-adapter/commit/b352f20ec688b06d2c98dc8d01fd788f49f3a450))


### 📦 Build System

* **release:** set tarballDir to string ([f61a983](https://github.com/hashi-at-home/cdevents-adapter/commit/f61a98355260de7bc95cf31bcb821770a7613c99))


### 🔧 Chores

* **deps:** update dependency @types/node to v24.10.1 ([a6a540d](https://github.com/hashi-at-home/cdevents-adapter/commit/a6a540d29c6148b3a85213003dde3a91f6ffd82e))
* **deps:** update dependency python to v3.14.2 ([c66c59b](https://github.com/hashi-at-home/cdevents-adapter/commit/c66c59b96739ab3fa8d8c5ccae9d0d01f769b2ff))
* **deps:** update dependency vitest-environment-miniflare to v2.14.4 ([5991aed](https://github.com/hashi-at-home/cdevents-adapter/commit/5991aed1136811a30cdc82a1df839defd3f39c56))
* **deps:** update dependency zod to v4.2.1 ([848c3a8](https://github.com/hashi-at-home/cdevents-adapter/commit/848c3a8aa4193baa19449dba56e949e2402604d2))
* update docs on the page ([ad0442f](https://github.com/hashi-at-home/cdevents-adapter/commit/ad0442f6aa2a5c1e0266a021fb5810421ee1c616))

## [2.0.1](https://github.com/hashi-at-home/cdevents-adapter/compare/v2.0.0...v2.0.1) (2025-11-16)


### 🐛 Bug Fixes

* **queue:** fix name of binding to queue ([bfb907c](https://github.com/hashi-at-home/cdevents-adapter/commit/bfb907cb54f5556cc900486bdaf54d43c2f94c57))

## [2.0.0](https://github.com/hashi-at-home/cdevents-adapter/compare/v1.0.0...v2.0.0) (2025-11-16)


### ⚠ BREAKING CHANGES

* deploy in hashiatho.me domain

### 🔧 Chores

* deploy in hashiatho.me domain ([ec13681](https://github.com/hashi-at-home/cdevents-adapter/commit/ec136814a1ef301090625a5e22ccd4601b10d20a))
* **deps:** update dependency @cloudflare/vite-plugin to v1.14.2 ([77cb0ef](https://github.com/hashi-at-home/cdevents-adapter/commit/77cb0efc4a1b22963e41d7822cfac55ffb456045))
* **deps:** update dependency hono to v4.10.6 ([bbcc469](https://github.com/hashi-at-home/cdevents-adapter/commit/bbcc469ff6ee3627c3d25aafa60aa942725ea093))
* rename worker ([1efd3d8](https://github.com/hashi-at-home/cdevents-adapter/commit/1efd3d80fe08a6b256f7bc32bbef64f902e201ba))
* update dependencies after npm audit fix ([4eb8065](https://github.com/hashi-at-home/cdevents-adapter/commit/4eb8065387012d52711ae406623f4f42387ab56b))

## 1.0.0 (2025-11-16)


### ✨ Features

* add github addapter and cdevent schemas ([db48bd8](https://github.com/hashi-at-home/cdevents-adapter/commit/db48bd83d2e2b5d70e1bdc79b91e6802eadba101))
* **github:** add job workflow waiting handler ([75851e0](https://github.com/hashi-at-home/cdevents-adapter/commit/75851e031507e8b76e8c0f32a882933f04225bea))
* initial commit of main application ([aebd58d](https://github.com/hashi-at-home/cdevents-adapter/commit/aebd58d474f044b671e3d40a33ccff27d1b0d6e6))


### 🐛 Bug Fixes

* **adapters:** accept ping events on workflow queued event POSTs ([7ebdc1b](https://github.com/hashi-at-home/cdevents-adapter/commit/7ebdc1bd0d367ff0440880fecc49da3653dc6287))
* **adapters:** ensure that responses contain eventtype ([4fac906](https://github.com/hashi-at-home/cdevents-adapter/commit/4fac90611e30f4cf53fb48d84393961eddb3e730))
* add queue bindings and invoke hono with Env object ([92bf9e1](https://github.com/hashi-at-home/cdevents-adapter/commit/92bf9e125e70252a649269069ff9c742dace9452))
* **config:** add binding to r2 bucket ([06c243a](https://github.com/hashi-at-home/cdevents-adapter/commit/06c243ae29f65b09f00c780a9b2c69568555cb69))


### 📚 Documentation

* **readme:** add readme ([6b5c4ee](https://github.com/hashi-at-home/cdevents-adapter/commit/6b5c4ee71546b0fc724ab4c7434aa6c11a4860c9))


### ✅ Tests

* **adapters:** cast response json as valid object ([b43cc48](https://github.com/hashi-at-home/cdevents-adapter/commit/b43cc4825cf5271db8dd6aafe969b630a8a0b948))
* add cloudflare mock function in vitest setup ([0b7bebd](https://github.com/hashi-at-home/cdevents-adapter/commit/0b7bebd6d55f0bbbdc2a3f285428d78eae506bc7))
* add tests for github adapter and schema validation ([3e85a58](https://github.com/hashi-at-home/cdevents-adapter/commit/3e85a58c833a20d0832451c75bc8374cd0f8da56))


### 📦 Build System

* add mise configuration ([2ace73b](https://github.com/hashi-at-home/cdevents-adapter/commit/2ace73b02ca41aa472ab61d64077bd80fbd99409))


### 👷 CI/CD

* add ci workflow ([3c8b235](https://github.com/hashi-at-home/cdevents-adapter/commit/3c8b2358b0572d519779f418be11fa81a182bc10))
* remove npm ci and replace with mise task ([be224ad](https://github.com/hashi-at-home/cdevents-adapter/commit/be224ade034fbdd0acef3f3ac28c700d6865b8d6))
* replace ci with install ([7a2110d](https://github.com/hashi-at-home/cdevents-adapter/commit/7a2110de0a114da8d5a92afe6057dd39622697b4))


### 🔧 Chores

* add initial gitignore ([b608ce6](https://github.com/hashi-at-home/cdevents-adapter/commit/b608ce64a6061f44ca7123c92831c448b332a868))
* add pre-commit hooks ([39ef449](https://github.com/hashi-at-home/cdevents-adapter/commit/39ef4491f6e0541a0fb6a4aeb1112ff61f645cf9))
* add relase configuration and job ([dea61fa](https://github.com/hashi-at-home/cdevents-adapter/commit/dea61fadb626b171a079818bdb63241d9a52a5be))
* **deps:** add swagger-ui and openapi ([32735bd](https://github.com/hashi-at-home/cdevents-adapter/commit/32735bd7fdb0d15cb69725e9fc4d8965b44b34a9))
* **deps:** update actions/upload-artifact action to v5 ([5e69c84](https://github.com/hashi-at-home/cdevents-adapter/commit/5e69c84fc8816b50cdbd9f4df6d9ec6e1491610c))
* **deps:** update dependency @hono/zod-openapi to v1.1.4 ([791f857](https://github.com/hashi-at-home/cdevents-adapter/commit/791f857eee2ee84f333424310e36a52e1dd4b908))
* **deps:** update dependency hono to v4.10.3 [security] ([3d0b061](https://github.com/hashi-at-home/cdevents-adapter/commit/3d0b06107576c1edbfa6558038206fac2a866ff9))
* **deps:** update dependency node to v22.21.1 ([b370152](https://github.com/hashi-at-home/cdevents-adapter/commit/b37015251ba97500e6b5b395a4a51b889373210a))
* **deps:** update dependency vite to v7 ([222e430](https://github.com/hashi-at-home/cdevents-adapter/commit/222e43042f6c64a10a2fe8993acd7d1b84e468e9))
* **deps:** update dependency vite-ssr-components to ^0.5.0 ([f73ae6d](https://github.com/hashi-at-home/cdevents-adapter/commit/f73ae6de41b16ce82dc75ed4714ca5a5e207a053))
* **deps:** update dependency vitest to v4 ([620eab0](https://github.com/hashi-at-home/cdevents-adapter/commit/620eab0e0250c8258a9ca8b22ce6dd9bc64354a4))
* **deps:** update github/codeql-action action to v4 ([bc00020](https://github.com/hashi-at-home/cdevents-adapter/commit/bc0002006843db8577022770ab44bc0b523843c0))
* **deps:** update node.js to v24 ([6417f3e](https://github.com/hashi-at-home/cdevents-adapter/commit/6417f3ee4a50358778772a5aa699b51090253a80))
* enable observability by default ([e5a729c](https://github.com/hashi-at-home/cdevents-adapter/commit/e5a729c02b16086c975627b7acc5a8a39ff2933e))
