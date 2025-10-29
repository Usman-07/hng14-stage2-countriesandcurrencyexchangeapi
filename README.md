# Country Currency & Exchange API

Node.js/Express backend that caches country data + exchange rates in MySQL.

## Features
- `POST /countries/refresh` → fetches countries + exchange rates, caches/updates DB
- `GET /countries` → list, filter, sort
- `GET /countries/:name` → single country (case-insensitive)
- `DELETE /countries/:name`
- `GET /status` → stats
- `GET /countries/image` → summary image (cache/summary.png)

## Requirements
- Node 18+
- MySQL
- Build tools for `canvas` (Cairo) installed on OS

## Setup
1. Clone repo
2. `cd Stage2`
3. `npm install`
4. Create `.env`:
5. Create database: `CREATE DATABASE countrydb;`
6. Run:
- `npm run dev` (requires nodemon)
- or `npm start`

## Usage
- Trigger refresh: `POST http://localhost:3000/countries/refresh`
- List: `GET http://localhost:3000/countries`
- Image: `GET http://localhost:3000/countries/image`

## Notes
- Refresh uses `https://restcountries.com/v2/all?fields=name,capital,region,population,flag,currencies`
- Exchange rates from `https://open.er-api.com/v6/latest/USD`
- If external API fails, refresh responds 503 and DB is not modified.

## Deploy
- Ensure environment variables set
- Host options: Heroku, Railway, AWS, etc. (Vercel/Render forbidden per instructions)

## Testing
- Use Postman/cURL for endpoints.
- After refresh, check `cache/summary.png` file exists.

