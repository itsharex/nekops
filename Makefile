## Embedded: build all embedded resources
.PHONY: embedded
embedded: ./src-tauri/embedded/bin/websockify-* ./src-tauri/embedded/bin/pipessh-*

## Build embedded websockify
./src-tauri/embedded/bin/websockify-*: ./src-tauri/embedded/workspace/websockify/
	cd ./src-tauri/embedded/workspace/websockify/ && go build .
	node ./utils/sidecar-rename.mjs websockify

## Build embedded pipessh
./src-tauri/embedded/bin/pipessh-*: ./src-tauri/embedded/workspace/pipessh/
	cd ./src-tauri/embedded/workspace/pipessh/ && go build .
	node ./utils/sidecar-rename.mjs pipessh

.PHONY: release
release: embedded
	pnpm tauri build
