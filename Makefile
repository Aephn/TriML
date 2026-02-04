build:
	go build -o bin/textual-api ./src/textual-api

run:
	./bin/textual-api

runall:
	rm -rf ./bin/
	go build -o bin/textual-api ./src/textual-api
	./bin/textual-api

clean:
	rm -rf ./bin/