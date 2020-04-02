client : ./game/game.js
	browserify ./game/game.js -o bundle.js --ignore lapack

package : client
	rm -rfv package
	mkdir package
	mkdir package/game
	cp game/asset_manifest.json package/game/asset_manifest.json
	cp bundle.js package/bundle.js
	cp game/index.html package/index.html
	cp -r sound package/sound
	cp -r images package/images

clean :
	rm -v bundle.js
	rm -rfv package
