# CD Events Adapter

CD Events Adapter built to run on Cloudflare

## Development environment

We use [mise](https://mise.jdx.dev) to configure the development environment.

```shell
mise trust
mise install
```

```txt
npm install
npm run dev
```

```txt
npm run deploy
```

[For generating/synchronizing types based on your Worker configuration run](https://developers.cloudflare.com/workers/wrangler/commands/#types):

```txt
npm run cf-typegen
```
