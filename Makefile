.PHONY: dev stop logs shell db lint format test build push

# ── Dev local ────────────────────────────────────────────────────────────────
dev:
	docker compose up --build -d

stop:
	docker compose down

logs:
	docker compose logs -f backend

shell:
	docker compose exec backend sh

db:
	docker compose exec postgres psql -U $${DB_USER:-yobante} -d $${DB_NAME:-yobante}

# ── Qualité ───────────────────────────────────────────────────────────────────
lint:
	npm run lint

format:
	npm run format

lint-fix:
	npm run lint:fix

# ── Tests ─────────────────────────────────────────────────────────────────────
test:
	npm test

test-coverage:
	npm run test:coverage

# ── Docker production ─────────────────────────────────────────────────────────
build:
	docker build -t yobante-boutique-back:latest .

push:
	docker push $${DOCKERHUB_USERNAME}/yobante-boutique-back:latest

# ── Base de données ────────────────────────────────────────────────────────────
seed:
	npm run seed:admin

backup:
	docker compose exec postgres pg_dump -U $${DB_USER:-yobante} $${DB_NAME:-yobante} > backup_$$(date +%Y%m%d_%H%M%S).sql

restore:
	docker compose exec -T postgres psql -U $${DB_USER:-yobante} -d $${DB_NAME:-yobante} < $(FILE)
