# Detect OS
ifeq ($(OS),Windows_NT)
	DETECTED_OS := Windows
	VENV_BIN := .venv/Scripts
	PYTHON := python
	OPEN_CMD := start
	SLEEP := timeout /t 2 /nobreak >nul
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		DETECTED_OS := Linux
		OPEN_CMD := xdg-open
	endif
	ifeq ($(UNAME_S),Darwin)
		DETECTED_OS := macOS
		OPEN_CMD := open
	endif
	VENV_BIN := .venv/bin
	PYTHON := python3
	SLEEP := sleep 2
endif

# Colors for output
BLUE := \033[0;34m
GREEN := \033[0;32m
NC := \033[0m # No Color

.PHONY: help init backend frontend clean

help:
	@echo "$(BLUE)Available commands:$(NC)"
	@echo "  $(GREEN)make init$(NC)      - Initialize project (setup venv and install dependencies)"
	@echo "  $(GREEN)make backend$(NC)   - Run backend server"
	@echo "  $(GREEN)make frontend$(NC)  - Run frontend dev server and open browser"
	@echo "  $(GREEN)make clean$(NC)     - Remove virtual environment and node_modules"

init:
	@echo "$(BLUE)Initializing project for $(DETECTED_OS)...$(NC)"
	@echo "$(BLUE)Step 1: Creating Python virtual environment...$(NC)"
	$(PYTHON) -m venv .venv
	@echo "$(GREEN)✓ Virtual environment created$(NC)"
	@echo "\n$(BLUE)Step 2: Installing Python dependencies...$(NC)"
	$(VENV_BIN)/pip install -r requirements.txt
	@echo "$(GREEN)✓ Python dependencies installed$(NC)"
	@echo "\n$(BLUE)Step 3: Installing backend dependencies...$(NC)"
	cd backend && npm install
	@echo "$(GREEN)✓ Backend dependencies installed$(NC)"
	@echo "\n$(BLUE)Step 4: Installing frontend dependencies...$(NC)"
	cd frontend && npm install
	@echo "$(GREEN)✓ Frontend dependencies installed$(NC)"
	@echo "$(GREEN)✓ Project initialization complete!$(NC)"

backend:
	@echo "$(BLUE)Starting backend server...$(NC)"
	@cd backend && npm start

frontend:
	@echo "$(BLUE)Starting frontend dev server...$(NC)"
ifeq ($(OS),Windows_NT)
	@start cmd /C "timeout /t 2 /nobreak >nul && start http://localhost:5173"
	@cd frontend && npm run dev
else
	@(sleep 2 && $(OPEN_CMD) http://localhost:5173 &)
	@cd frontend && npm run dev
endif

clean:
	@echo "$(BLUE)Cleaning up...$(NC)"
	@echo "Removing virtual environment..."
	@rm -rf .venv venv
	@echo "Removing node_modules..."
	@rm -rf backend/node_modules frontend/node_modules
	@rm -rf backend/package-lock.json frontend/package-lock.json
	@echo "$(GREEN)✓ Cleanup complete$(NC)"
