# openZro · docs site Makefile
#
# `make help` lists every target with a short description.
#
# Conventions match the core repo's Makefile: namespaced targets
# (gen.api, gen.llm) so tab-completion is deterministic, and short
# top-level aliases (dev, build, lint) call into the namespaced ones.

.DEFAULT_GOAL := help

NPM ?= npm

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------

.PHONY: help
help: ## Show this help
	@awk 'BEGIN{FS=":.*?## "; printf "\nUsage: make \033[36m<target>\033[0m\n\nTargets:\n"} \
	     /^[a-zA-Z0-9_.-]+:.*?## / {printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""

# ---------------------------------------------------------------------------
# Install / clean
# ---------------------------------------------------------------------------

.PHONY: install clean clean.deep
install: ## Install pinned deps (npm ci when lockfile exists; npm install to bootstrap one)
	@if [ -f package-lock.json ] || [ -f npm-shrinkwrap.json ]; then \
	  echo "lockfile present — running npm ci"; \
	  $(NPM) ci ; \
	else \
	  echo "no lockfile yet — running npm install to generate one"; \
	  $(NPM) install ; \
	fi

clean: ## Remove the Next.js build output (.next/) — keeps node_modules
	rm -rf .next

clean.deep: ## Remove .next AND node_modules (forces a fresh install on the next dev/build)
	rm -rf .next node_modules

# ---------------------------------------------------------------------------
# Dev / build / serve
# ---------------------------------------------------------------------------

.PHONY: dev build start
dev: ## Start the dev server on http://localhost:3000 (auto-runs gen.llm + gen.routes first)
	$(NPM) run dev

build: ## Production static build (output in .next/) — runs gen.llm + gen.routes first
	$(NPM) run build

start: ## Serve the production build on http://localhost:3000 (run `make build` first)
	$(NPM) run start

# ---------------------------------------------------------------------------
# Lint
# ---------------------------------------------------------------------------

.PHONY: lint
lint: ## ESLint over src/
	$(NPM) run lint

# ---------------------------------------------------------------------------
# Generators
# ---------------------------------------------------------------------------
#
# gen.api regenerates the API reference pages from the core repo's
# openapi.yml. It needs `swagger-codegen` on PATH (Java tool); install
# via `brew install swagger-codegen` on macOS or `apt install
# swagger-codegen` on Debian/Ubuntu. Skipped by default — only re-run
# when openapi.yml changes upstream.
#
# gen.llm + gen.routes run automatically inside `make dev` and
# `make build` so you don't usually invoke them directly. Exposed
# here for debugging the scripts in isolation.

.PHONY: gen.api gen.llm gen.routes
gen.api: ## Regenerate the API reference pages from openzro/openzro openapi.yml (needs swagger-codegen)
	$(NPM) run gen

gen.llm: ## Regenerate the llms.txt files crawlers use to ingest the docs
	$(NPM) run gen:llm

gen.routes: ## Regenerate the "Edit on GitHub" route map
	$(NPM) run gen:edit-routes

# ---------------------------------------------------------------------------
# Convenience: full first-time setup
# ---------------------------------------------------------------------------

.PHONY: bootstrap
bootstrap: install ## install + gen.routes + gen.llm so `make dev` is instant on the next run
	$(NPM) run gen:llm
	$(NPM) run gen:edit-routes
