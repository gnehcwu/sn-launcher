clean:
	rm -rf .parcel-cache
	rm -rf dist

build: clean
	npm run build:chromium
	npm run build:firefox
	cd dist/chromium && zip -r ../chromium.zip .
	cd dist/firefox && zip -r ../firefox.zip .