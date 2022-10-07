# open-sample

An open sample auditable NodeJS API.

```json
POST http://localhost:3000/v1/entity
x-app-audit-event: create-entity
authorization: Bearer PUBLIC
content-type: application/json

{
    "name": "My Entity"
}

GET http://localhost:3000/v1/entity
x-app-audit-event: get-entity
authorization: Bearer PUBLIC
```

## Installation
```bash
pnpm i
```

## Start
```
npm start
```

## Dev
```
npm run dev
```