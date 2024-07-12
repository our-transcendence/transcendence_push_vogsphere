SHELL := /usr/bin/bash
PY := python3.10

all: envFile ssl
	docker compose up --build -d

envFile:
	source .env && ${PY} ./env_creator.py

ssl:
	source .env && ${PY} ./ssl_creator.py

clean:
	rm -rf ssl
	${PY} ./env_delitor.py

down:
	@[ $$(docker ps | wc -l) == 1 ] || docker compose down

fclean: down clean
	docker system prune -a
	@docker volume rm $$(docker volume ls -q) || echo "No volumes to remove"

re: fclean all

logs:
	docker compose logs $(filter-out $@,$(MAKECMDGOALS)) -f

bash:
	docker compose exec $(filter-out $@,$(MAKECMDGOALS)) bash

%:
	@:

.PHONY: ssl envFile bash logs re clean fclean all down
