.PHONY: build watch test

build:
	tsc -d -p .

watch:
	tsc -d -p . -w

test: build
	mocha test

publish: test
	npm publish
