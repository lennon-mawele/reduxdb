.PHONY: build watch test

build:
	tsc -d -p .

watch:
	tsc -d -p . -w

test: build
	tsc test/js/*.ts
	node test/js/*.js
