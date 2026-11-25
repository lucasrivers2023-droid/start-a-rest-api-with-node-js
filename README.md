# Node.js REST API

A starter REST API built with Node.js (ESM) and Express 5.

## Scripts

- `npm start` — Start the server (`PORT=3000` by default)
- `npm run dev` — Start the server with file watching (`node --watch`)
- `npm test` — Run integration tests with `node --test`

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| `GET` | `/` | API overview and endpoint list |
| `GET` | `/health` | Health check (`status`, `uptime`, `timestamp`) |
| `GET` | `/api/items` | List items (supports `?q=` search and `?completed=true\|false`) |
| `GET` | `/api/items/:id` | Get a single item by ID |
| `POST` | `/api/items` | Create a new item (`{ "title": "...", "completed": false }`) |
| `PUT` | `/api/items/:id` | Replace an existing item |
| `PATCH` | `/api/items/:id` | Partially update an existing item |
| `DELETE` | `/api/items/:id` | Delete an item |

## Examples

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/items
curl -X POST http://localhost:3000/api/items \
  -H "Content-Type: application/json" \
  -d '{"title":"Write API tests","completed":false}'
```
