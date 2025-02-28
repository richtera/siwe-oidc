# OpenID Connect Identity Provider for Sign-In with Ethereum

## Getting Started

Two versions are available, a stand-alone binary (using Axum and Redis) and a
Cloudflare Worker. They use the same code base and are selected at compile time
(compiling for `wasm32` will make the Worker version).

### Cloudflare Worker

You will need [`wrangler`](https://github.com/cloudflare/wrangler).

First, copy the configuration file template:
```bash
cp wrangler_example.toml wrangler.toml
cp .env.example .env
```

Then replace the following fields:
- `account_id`: your Cloudflare account ID;
- `zone_id`: (Optional) DNS zone ID;
- `kv_namespaces`: a KV namespace ID (created with `wrangler kv:namespace create SIWE_OIDC`); and
- the environment variables under `vars`.

Then replace the following fields in .env:
- `INFURA_ID`= your infura id;
- `PORTIS_ID`= your portis key;
- `FORTMATIC_KEY`= your formatic key;

You will also need to add a secret RSA key in PEM format:
```
wrangler secret put RSA_PEM
```

At this point, you should be able to create/publish the worker:
```
wrangler pages publish static
```

### Stand-Alone Binary

> Note that currently the published Docker image doesn't support all wallets due
> to the need of bundling secrets for web3modal at compile-time.

#### Dependencies

Redis, or a Redis compatible database (e.g. MemoryDB in AWS), is required.

#### Starting the IdP

The Docker image is available at `ghcr.io/spruceid/siwe_oidc:0.1.0`. Here is an
example usage:
```bash
docker run -p 8000:8000 -e SIWEOIDC_REDIS_URL="redis://redis" ghcr.io/spruceid/siwe_oidc:latest
```

It can be configured either with the `siwe-oidc.toml` configuration file, or
through environment variables:
* `SIWEOIDC_ADDRESS` is the IP address to bind to.
* `SIWEOIDC_REDIS_URL` is the URL to the Redis instance.
* `SIWEOIDC_BASE_URL` is the URL you want to advertise in the OIDC configuration
  (e.g. `https://oidc.example.com`).
* `SIWEOIDC_RSA_PEM` is the signing key, in PEM format. One will be generated if
  none is provided.

### OIDC Functionalities

The current flow is very basic -- after the user is authenticated you will
receive:
- an Ethereum address as the subject (`sub` field); and
- an ENS domain as the `preferred_username` (with a fallback to the address).

For the core OIDC information, it is available under
`/.well-known/openid-configuration`.

OIDC Conformance Suite:
- 🟨 (25/29, and 10 skipped) [basic](https://www.certification.openid.net/plan-detail.html?plan=gXe7Ju1O1afZa&public=true) (`email` scope skipped,  `profile` scope partially supported, ACR, `prompt=none` and request URIs yet to be supported);
- 🟩 [config](https://www.certification.openid.net/plan-detail.html?plan=SAmBjvtyfTDVn&public=true);
- 🟧 [dynamic code](https://www.certification.openid.net/plan-detail.html?plan=7rexGcCd4SWJa&public=true).

### TODO Items

* Additional information, from native projects (e.g. ENS domains profile
  pictures), to more traditional ones (e.g. email).

## Development

### Cloudflare Worker

```bash
wrangler pages dev static
```
You can now use http://127.0.0.1:8787/.well-known/openid-configuration.

### Stand Alone Binary

A Docker Compose is available to test the IdP locally with Keycloak.

1. You will first need to run:
```bash
docker-compose -f test/docker-compose.yml up -d
```

2. And then edit your `/etc/hosts` to have `siwe-oidc` point to `127.0.0.1`.
   This is so both your browser, and Keycloak, can access the IdP.

3. In Keycloak, you will need to create a new IdP. You can use
   `http://siwe-oidc:8000/.well-known/openid-configuration` to fill the settings
   automatically. As for the client ID/secret, you can use `sdf`/`sdf`.

## Disclaimer

Our identity provider for Sign-In with Ethereum has not yet undergone a formal
security audit. We welcome continued feedback on the usability, architecture,
and security of this implementation.
