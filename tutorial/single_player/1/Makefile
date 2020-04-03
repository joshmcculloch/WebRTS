client : ./game.js
	ln -s ../../engine/ ../engine
	browserify ./game.js -o bundle.js --ignore lapack
	rm ../engine

package : client
	rm -rfv build
	mkdir build
	mkdir build/game
	cp asset_manifest.json build/game/asset_manifest.json
	cp bundle.js build/bundle.js
	cp index.html build/index.html
	cp gui.css build/gui.css
	cp -r sound build/sound
	cp -r images build/images

clean :
	rm -v bundle.js
	rm -rfv package
