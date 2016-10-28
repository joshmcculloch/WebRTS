/*
The ObjectManager keeps track of all current GameObjects. 
 */
class ObjectManager {
    constructor () {
        this.gameObjects = [];
    }
    add_object (gameObject) {
        this.gameObjects.push(gameObject)
    }
}