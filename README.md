# open-sample

An open sample API.

## Typical Request Format

```yml
# POST http://localhost:3000/v1/entity
x-app-event: create-entity
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
<img width="1116" alt="meta_graph" src="https://user-images.githubusercontent.com/1900724/195940778-f99efd6d-4637-4fdb-adc6-1b1a4be905d8.png">
