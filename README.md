# open-sample

An open sample API.

## Typical Request Format

```yml
# POST http://localhost:3000/v1/entity
x-app-audit-event: create-entity
authorization: Bearer PRIVATE_KEY
content-type: application/json
```
```json
{
    "name": "Bot",
    "prompt": "Hello, how are you?"
}
```

## Installation
```bash
pnpm i
```

## Start
```
pnpm start
```

## Dev
```
pnpm run dev
```

## Meta Graph
<img width="812" alt="metagraph" src="https://user-images.githubusercontent.com/1900724/195496438-763b7f3d-22a3-435d-972e-8a21ca87750e.png">

