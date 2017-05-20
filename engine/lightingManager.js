exports.LightingManager = class {
    constructor (engine) {
        this.engine = engine;
        this.shadowCanvas = document.createElement('canvas');
        this.shadowContext = this.shadowCanvas.getContext('2d');
        this.ambientLight = new LightColour(255,255,255);
        this.debugMode = false;
        this.lights = [];
    }

    render(viewVolume) {
        var vv = viewVolume;
        this.shadowCanvas.width = vv.w;
        this.shadowCanvas.height = vv.h;
        this.shadowContext.fillStyle = this.ambientLight.asStyle();
        this.shadowContext.globalCompositeOperation="source-over";
        this.shadowContext.fillRect(0,0,vv.w,vv.h);

        this.shadowContext.globalCompositeOperation="lighter";

        for (let light of this.lights) {

            var grd=this.shadowContext.createRadialGradient(light.location.e(1)-vv.x, light.location.e(2)-vv.y,0,
                light.location.e(1)-vv.x, light.location.e(2)-vv.y,light.range);
            grd.addColorStop(0,light.lightColour.asStyle());
            grd.addColorStop(1,"black");

            this.shadowContext.fillStyle=grd;
            this.shadowContext.fillRect(0,0,vv.w,vv.h);
        }



        if (this.debugMode) {
            this.engine.context.drawImage(this.shadowCanvas, vv.x, vv.y);
        } else {
            this.engine.context.globalCompositeOperation="multiply";
            this.engine.context.drawImage(this.shadowCanvas, vv.x, vv.y);
            this.engine.context.globalCompositeOperation="source-over";
        }

        this.lights = [];
    }

    addLight(light) {
        if (light) {
            this.lights.push(light);
        }
    }
};

class LightColour {
    constructor (r,g,b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    asStyle(intensity=1) {
        return "rgb("+Math.floor(this.r*intensity)+","+Math.floor(this.g*intensity)+","+Math.floor(this.b*intensity)+")";
    }

    lerpTo(other, v){
        var i = 1.0-v;
        return new LightColour(this.r*i+other.r*v, this.g*i+other.g*v, this.b*i+other.b*v);
    }
}
exports.LightColour = LightColour;

exports.Light = class {
    constructor (lightColour,range,location) {
        this.lightColour = lightColour;
        this.range = range;
        this.location = location;
    }

};