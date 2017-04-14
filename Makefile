.PHONY: build watch test

build:
	tsc -d -p .

watch:
	tsc -d -p . -w

test:
	tsc test/*.ts
	node test/*.js
