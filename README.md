# React + Express + MySQL — Google OAuth Auth Starter (PL)

**Funkcje**
- Logowanie WYŁĄCZNIE przez Google OAuth 2.0 (brak hasła)
- JWT access (15 min) + rotacyjny refresh (7 dni) w httpOnly, sameSite cookies
- Auto-odświeżanie sesji przez interceptor Axios (401 → /auth/refresh)
- Ochrona tras w React Router (ProtectedRoute)
- Tailwind CSS
- Nagłówek z Loguj/Wyloguj i linkiem do chronionej podstrony
- MySQL: tabele `users` + `refresh_tokens`
- CORS z `credentials`, bezpieczne flagi cookies w produkcji
- Konfiguracja przez `.env`
- **Docker**: `docker-compose` (MySQL + backend + frontend)

## Szybki start (bez Dockera)

1) **Google OAuth**  
Google Cloud → Credentials → OAuth Client (Web).  
**Redirect URI:** `http://localhost:4000/auth/google/callback`  
**JS origin:** `http://localhost:5173`

2) **MySQL**  
Utwórz bazę (np. `auth_demo`). Wpisz dane do `/server/.env`.  
Serwer przy starcie sam utworzy tabele.

3) **Uruchomienie**
```bash
# Backend
cd server
cp .env.example .env    # uzupełnij dane
npm i
npm run dev

# Frontend (w drugim terminalu)
cd client
cp .env.example .env
npm i
npm run dev
```
Odwiedź: `http://localhost:5173`

## Szybki start (Docker)

```bash
# w katalogu głównym
cp server/.env.docker.example server/.env   # uzupełnij GOOGLE_CLIENT_* i JWT_* sekrety
docker compose up --build
```
- Frontend: `http://localhost:5173`  
- Backend API: `http://localhost:4000`  
- MySQL: host `localhost:3306` (w kontenerze: `db:3306`), root pass: `root`

> W Dockerze backend łączy się z DB po hoście `db`, więc w `server/.env` ustaw `MYSQL_HOST=db`.

## Zmienne środowiskowe

**`/server/.env`**
```
PORT=4000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:4000

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh

MYSQL_HOST=localhost
MYSQL_USER=root
MYSQL_PASSWORD=yourpassword
MYSQL_DATABASE=auth_demo

NODE_ENV=development
```

**`/server/.env.docker.example`**
```
PORT=4000
CLIENT_URL=http://localhost:5173
SERVER_URL=http://localhost:4000

GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

JWT_ACCESS_SECRET=change_me_access
JWT_REFRESH_SECRET=change_me_refresh

MYSQL_HOST=db
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=auth_demo

NODE_ENV=development
```

**`/client/.env`**
```
VITE_API_BASE=http://localhost:4000
```

## Konfiguracja tras chronionych
Edytuj `/client/src/routes.js` aby dodać/zmienić strony z `protected: true/false`.

## Uwagi dot. bezpieczeństwa
- Ustaw `NODE_ENV=production` w serwerze (włączy `secure` cookies) i właściwą domenę/origin w produkcji.
- Refresh tokeny są rotowane i unieważniane po użyciu oraz przy wylogowaniu.
