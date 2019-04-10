const GetValue = Phaser.Utils.Objects.GetValue;


const EE = Phaser.Events.EventEmitter;

class TickTask extends EE {
    constructor(parent, config) {
        super();
        this.parent = parent;
        this._isRunning = false;
        this.tickingState = false;
        this.setTickingMode(GetValue(config, 'tickingMode', 1));
    }

    // override
    boot() {
        if ((this.tickingMode === 2) && (!this.tickingState)) {
            this.startTicking();
        }
    }

    // override
    shutdown() {
        super.shutdown();
        if (this.tickingState) {
            this.stopTicking();
        }
    }

    setTickingMode(mode) {
        if (typeof (mode) === 'string') {
            mode = TICKINGMODE[mode];
        }
        this.tickingMode = mode;
    }

    // override
    startTicking() {
        this.tickingState = true;
    }

    // override
    stopTicking() {
        this.tickingState = false;
    }

    get isRunning() {
        return this._isRunning;
    }

    set isRunning(value) {
        if (this._isRunning === value) {
            return;
        }

        this._isRunning = value;
        if ((this.tickingMode === 1) && (value != this.tickingState)) {
            if (value) {
                this.startTicking();
            } else {
                this.stopTicking();
            }
        }
    }

    start() {
        this.isRunning = true;
        return this;
    }

    pause() {
        this.isRunning = false;
        return this;
    }

    resume() {
        this.isRunning = true;
        return this;
    }

    stop() {
        this.isRunning = false;
        return this;
    }

    complete() {
        this.isRunning = false;
        if (this.tickingMode !== 0) {
            this.emit('complete', this.parent, this);
        }
    }
}

const TICKINGMODE = {
    'no': 0,
    'lazy': 1,
    'always': 2
}

var GetSceneObject = function (object) {
    if (isSceneObject(object)) { // object = scene
        return object;
    } else if (object.scene && isSceneObject(object.scene)) { // object = game object
        return object.scene;
    } else if (object.parent && object.parent.scene && isSceneObject(object.parent.scene)) { // parent = bob object
        return object.parent.scene;
    }
}

const SceneKlass = Phaser.Scene;
var isSceneObject = function(object) {
    return (object instanceof SceneKlass);
}

class Clock extends TickTask {
    constructor(parent, config) {
        super(parent, config);

        this.parent = parent;
        this.scene = GetSceneObject(parent);
        this.resetFromJSON(config);
        this.boot();
    }

    resetFromJSON(o) {
        this.isRunning = GetValue(o, 'isRunning', false);
        this.timeScale = GetValue(o, 'timeScale', 1);
        this.now = GetValue(o, 'now', 0);
        return this;
    }

    toJSON() {
        return {
            isRunning: this.isRunning,
            timeScale: this.timeScale,
            now: this.now,
            tickingMode: this.tickingMode
        };
    }

    boot() {
        super.boot();

        if (this.parent.on) {
            this.parent.on('destroy', this.destroy, this);
        }
    }

    shutdown() {
        super.shutdown();
        this.parent = undefined;
        this.scene = undefined;
    }

    destroy() {
        this.shutdown();
    }

    startTicking() {
        super.startTicking();
        this.scene.events.on('update', this.update, this);
    }

    stopTicking() {
        super.stopTicking();
        if (this.scene) { // Scene might be destoryed
            this.scene.events.off('update', this.update, this);
        }
    }

    start(startAt) {
        if (startAt === undefined) {
            startAt = 0;
        }
        this.now = startAt;
        super.start();
        return this;
    }

    seek(time) {
        this.now = time;
        return this;
    }

    update(time, delta) {
        if ((!this.isRunning) || (this.timeScale === 0)) {
            return this;
        }
        this.now += (delta * this.timeScale);
        return this;
    }
}