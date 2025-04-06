## Prepare: build all embedded resources
.PHONY: prepare
prepare: ./src-tauri/embedded/bin/websockify-*

## Build embedded websockify
./src-tauri/embedded/bin/websockify-*:
	cd ./src-tauri/embedded/workspace/websockify/ && go build .
	node ./utils/sidecar-rename.mjs websockify
