COMPOSE=docker-compose -f src/docker-compose.yml
BUILD=$(COMPOSE) build --parallel --no-cache
UP=$(COMPOSE) up -d
DOWN=$(COMPOSE) down
RESTART=$(COMPOSE) down && $(COMPOSE) up -d

.PHONY: all
all: build up

.PHONY: build
build:
	$(BUILD)

.PHONY: up
up:
	$(UP)

.PHONY: down
down:
	$(DOWN)

.PHONY: restart
restart:
	$(RESTART)

.PHONY: clean
clean:
	$(DOWN) --volumes
	docker rmi $$(docker images -a -q)

.PHONY: fclean
fclean:
	$(DOWN) --volumes
	docker builder prune -a -f
	docker rmi $$(docker images -a -q)

.PHONY: logs
logs:
	$(COMPOSE) logs -f

.PHONY: re
re: fclean all
