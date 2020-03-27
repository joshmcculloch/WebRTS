client : ./game/game.js
	browserify ./game/game.js -o bundle.js

package : client
	rm -rfv package
	mkdir package
	cp bundle.js package/bundle.js
	cp index.html package/index.html
	cp -r sound package/sound
	cp -r images package/images

clean :
	rm -v bundle.js
	rm -rfv package	
