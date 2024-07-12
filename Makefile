#!make

-include ./.config/.env.local

ifneq ("$(wildcard app/.env.local)","")
	export $(shell sed 's/=.*//' app/.env.local)
endif

local:          | build-local run-local

build-local:
	@echo "+\n++ Building local development Docker image...\n+"
	@docker-compose --env-file ./.config/.env.local build

run-local:
	@echo "+\n++ Running development container locally\n+"
	@docker-compose --env-file ./.config/.env.local up -d