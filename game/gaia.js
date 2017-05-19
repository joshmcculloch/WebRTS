
var Engine = require("../engine/clientEngine.js");
var lm = require("../engine/lightingManager.js");
exports.Gaia = class extends Engine.GameObject {
    constructor (engine,location) {
        super (engine, "",location);
        this.engine_id=-1;
        this.hour = 0;
        this.secondsPerHour = 3;
        this.object_name = "gaia_object";
    }

    to_descriptor() {
        var description = super.to_descriptor();
        description.hour = this.hour;
        description.secondsPerHour = this.secondsPerHour;
        return description;
    }

    from_descriptor (description) {
        super.from_descriptor(description);
        this.hour = description.hour;
        this.secondsPerHour = description.secondsPerHour;
    }

    draw () {
    }

    setTime(hour) {
        if (this.engine.server) {
            this.call_remote("hour",[hour]);
        }
        this.hour = hour;
    }

    update (delta_time) {

        this.hour += delta_time/this.secondsPerHour;
        if (this.hour > 24) {
            this.hour -=24;

        }

        if(this.engine.client) {
            var day = new lm.LightColour(255,255,255);
            var sunset = new lm.LightColour(140,80,100);
            var night = new lm.LightColour(25,25,25);
            var sunrise = new lm.LightColour(100,80,150);

            if (this.hour<6) {
                this.engine.lightingManager.ambientLight = night;
            } else if (6 < this.hour && this.hour < 7) {
                this.engine.lightingManager.ambientLight = night.lerpTo(sunrise, (this.hour-6)%1);
            } else if (7 < this.hour && this.hour < 8) {
                this.engine.lightingManager.ambientLight = sunrise.lerpTo(day, (this.hour-7)%1);
            } else if (7 < this.hour && this.hour < 17) {
                this.engine.lightingManager.ambientLight = day;
            } else if (17 < this.hour && this.hour < 18) {
                this.engine.lightingManager.ambientLight = day.lerpTo(sunset, (this.hour-17)%1);
            } else if (18 < this.hour && this.hour < 19) {
                this.engine.lightingManager.ambientLight = sunset.lerpTo(night, (this.hour-18)%1);
            } else if (19 < this.hour) {
                this.engine.lightingManager.ambientLight = night;
            }

        }


        return false;
    }

};