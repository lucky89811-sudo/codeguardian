.PHONY: setup test test-backend test-frontend run-backend run-frontend docker-up docker-down

setup:
	@echo "Setting up CodeGuardian..."
	cd backend && pip install -r requirements.txt
	cd frontend && npm install

test: test-backend test-frontend

test-backend:
	cd backend && python -m pytest tests -v

test-frontend:
	cd frontend && npm run build

run-backend:
	cd backend && python -m uvicorn app.main:app --reload --port 8000

run-frontend:
	cd frontend && npm run dev

docker-up:
	docker-compose up --build -d

docker-down:
	docker-compose down
