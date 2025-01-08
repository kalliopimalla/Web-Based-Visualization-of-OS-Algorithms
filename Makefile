
all:
	@echo "Nothing to do."

upload:
	rsync -av --delete \
		--exclude .git \
		--exclude Makefile \
		./ algovista:/srv/algovista.csd.auth.gr/

.PHONY: all upload
