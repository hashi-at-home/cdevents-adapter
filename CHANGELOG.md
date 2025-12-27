# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
