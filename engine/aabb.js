class AABB {

    constructor(x,y,w,h) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }

    is_inside(p) {
        if (this.x <= p.e(1) && p.e(1) < (this.x + this.w) &&
            this.y <= p.e(2) && p.e(2) < (this.y + this.h)) {
            return true;
        } else {
            return false;
        }
    }

    is_overlap (other) {
        if ((this.x+this.w) < other.x) return false; // a is left of b
        if (this.x > (other.x+other.w)) return false; // a is right of b
        if ((this.y+this.h) < other.y) return false; // a is above b
        if (this.y > (other.y+other.h)) return false; // a is below b
        return true;
    }

    ne () {
        return new AABB(this.x+this.w/2,this.y, this.w/2, this.h/2);
    }

    se () {
        return new AABB(this.x+this.w/2,this.y+this.h/2, this.w/2, this.h/2);
    }

    nw () {
        return new AABB(this.x,this.y, this.w/2, this.h/2);
    }

    sw () {
        return new AABB(this.x,this.y+this.h/2, this.w/2, this.h/2);
    }
}
exports.AABB = AABB;