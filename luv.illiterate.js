/*! luv 0.0.1 (2013-04-24) - https://github.com/kikito/luv.js */
/*! Minimal HTML5 game development lib */
/*! Enrique Garcia Cota */
window.Luv = function() {
    var extend = function(dest) {
        var properties;
        for (var i = 1; i < arguments.length; i++) {
            properties = arguments[i];
            for (var property in properties) {
                if (properties.hasOwnProperty(property)) {
                    dest[property] = properties[property];
                }
            }
        }
        return dest;
    };
    var remove = function(dest, names) {
        names = Array.isArray(names) ? names : [ names ];
        for (var i = 0; i < names.length; i++) {
            delete dest[names[i]];
        }
        return dest;
    };
    var create = Object.create;
    var baseMethods = {
        toString: function() {
            return "instance of " + this.getClass().getName();
        }
    };
    var Base = extend(function() {
        return create(baseMethods);
    }, {
        init: function() {},
        getName: function() {
            return "Base";
        },
        toString: function() {
            return "Base";
        },
        getSuper: function() {
            return null;
        },
        methods: baseMethods,
        include: function() {
            return extend.apply(this, [ this.methods ].concat(Array.prototype.slice.call(arguments, 0)));
        },
        subclass: function(name, methods) {
            methods = methods || {};
            var superClass = this;
            var getName = function() {
                return name;
            };
            var newMethods = remove(extend(create(superClass.methods), methods), "init");
            var newClass = extend(function() {
                var instance = create(newMethods);
                newClass.init.apply(instance, arguments);
                return instance;
            }, superClass, methods, {
                getName: getName,
                toString: getName,
                getSuper: function() {
                    return superClass;
                },
                methods: newMethods
            });
            newMethods.getClass = function() {
                return newClass;
            };
            return newClass;
        }
    });
    baseMethods.getClass = function() {
        return Base;
    };
    var Luv = Base.subclass("Luv", {
        init: function(options) {
            options = initializeOptions(options);
            var luv = this;
            luv.el = options.el;
            luv.el.tabIndex = 1;
            "load update draw run onResize onBlur onFocus".split(" ").forEach(function(name) {
                if (options[name]) {
                    luv[name] = options[name];
                }
            });
            luv.media = Luv.Media();
            luv.timer = Luv.Timer();
            luv.keyboard = Luv.Keyboard(luv.el);
            luv.mouse = Luv.Mouse(luv.el);
            luv.touch = Luv.Touch(luv.el);
            luv.audio = Luv.Audio(luv.media);
            luv.graphics = Luv.Graphics(luv.el, luv.media);
            if (options.fullWindow) {
                var resize = function() {
                    luv.graphics.setDimensions(window.innerWidth, window.innerHeight);
                    luv.onResize(window.innerWidth, window.innerHeight);
                };
                window.addEventListener("resize", resize, false);
                window.addEventListener("orientationChange", resize, false);
                luv.el.focus();
            }
            luv.el.addEventListener("blur", function() {
                luv.onBlur();
            });
            luv.el.addEventListener("focus", function() {
                luv.onFocus();
            });
        },
        load: function() {},
        draw: function() {},
        update: function(dt) {},
        run: function() {
            var luv = this;
            luv.load();
            var loop = function() {
                luv.timer.nativeUpdate(luv.el);
                var dt = luv.timer.getDeltaTime();
                luv.update(dt);
                luv.graphics.setCanvas();
                luv.graphics.clear();
                luv.draw();
                luv.timer.nextFrame(loop);
            };
            luv.timer.nextFrame(loop);
        },
        onResize: function(newWidth, newHeight) {},
        onBlur: function() {},
        onFocus: function() {}
    });
    Luv.Class = function(name, methods) {
        return Base.subclass(name, methods);
    };
    Luv.Base = Base;
    Luv.extend = extend;
    var initializeOptions = function(options) {
        options = options || {};
        var el = options.el, id = options.id, width = options.width, height = options.height, body = document.getElementsByTagName("body")[0], html = document.getElementsByTagName("html")[0], fullCss = "width: 100%; height: 100%; margin: 0; overflow: hidden;";
        if (!el && id) {
            el = document.getElementById(id);
        }
        if (el) {
            if (!width && el.getAttribute("width")) {
                width = Number(el.getAttribute("width"));
            }
            if (!height && el.getAttribute("height")) {
                height = Number(el.getAttribute("height"));
            }
        } else {
            el = document.createElement("canvas");
            body.appendChild(el);
        }
        if (options.fullWindow) {
            html.style.cssText = body.style.cssText = fullCss;
            width = window.innerWidth;
            height = window.innerHeight;
        } else {
            width = width || 800;
            height = height || 600;
        }
        el.setAttribute("width", width);
        el.setAttribute("height", height);
        options.el = el;
        options.width = width;
        options.height = height;
        return options;
    };
    return Luv;
}();

(function() {
    Luv.Timer = Luv.Class("Luv.Timer", {
        init: function() {
            this.microTime = performance.now();
            this.deltaTime = 0;
            this.deltaTimeLimit = Luv.Timer.DEFAULT_DELTA_TIME_LIMIT;
            this.events = {};
            this.maxEventId = 0;
        },
        nativeUpdate: function(el) {
            this.update((performance.now() - this.microTime) / 1e3, el);
        },
        update: function(dt) {
            this.deltaTime = Math.max(0, Math.min(this.deltaTimeLimit, dt));
            this.microTime += dt * 1e3;
            for (var id in this.events) {
                if (this.events.hasOwnProperty(id) && this.events[id].update(dt)) {
                    delete this.events[id];
                }
            }
        },
        setDeltaTimeLimit: function(deltaTimeLimit) {
            this.deltaTimeLimit = deltaTimeLimit;
        },
        getDeltaTimeLimit: function() {
            return this.deltaTimeLimit;
        },
        getDeltaTime: function() {
            return Math.min(this.deltaTime, this.deltaTimeLimit);
        },
        getFPS: function() {
            return this.deltaTime === 0 ? 0 : 1 / this.deltaTime;
        },
        nextFrame: function(f) {
            requestAnimationFrame(f);
        },
        after: function(timeToCall, callback, context) {
            return add(this, Luv.Timer.After(timeToCall, callback, context));
        },
        every: function(timeToCall, callback, context) {
            return add(this, Luv.Timer.Every(timeToCall, callback, context));
        },
        tween: function(timeToFinish, subject, to, options) {
            return add(this, Luv.Timer.Tween(timeToFinish, subject, to, options));
        },
        clear: function(id) {
            if (this.events[id]) {
                delete this.events[id];
                return true;
            }
            return false;
        }
    });
    Luv.Timer.DEFAULT_DELTA_TIME_LIMIT = .25;
    var add = function(timer, e) {
        var id = timer.maxEventId++;
        timer.events[id] = e;
        return id;
    };
    var performance = window.performance || Date;
    performance.now = performance.now || performance.msNow || performance.mozNow || performance.webkitNow || Date.now;
    var lastTime = 0, requestAnimationFrame = window.requestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.oRequestAnimationFrame || function(callback) {
        var currTime = performance.now(), timeToCall = Math.max(0, 16 - (currTime - lastTime)), id = setTimeout(function() {
            callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
    };
})();

(function() {
    Luv.Timer.After = Luv.Class("Luv.Timer.After", {
        init: function(timeToCall, callback, context) {
            this.timeRunning = 0;
            this.timeToCall = timeToCall;
            this.callback = callback;
            this.context = context;
        },
        update: function(dt) {
            this.timeRunning += dt;
            var diff = this.timeRunning - this.timeToCall;
            if (diff >= 0) {
                this.callback.call(this.context, diff);
                return true;
            }
            return false;
        }
    });
})();

(function() {
    Luv.Timer.Every = Luv.Class("Luv.Timer.Every", {
        init: function(timeToCall, callback, context) {
            this.timeRunning = 0;
            this.timeToCall = timeToCall;
            this.callback = callback;
            this.context = context;
        },
        update: function(dt) {
            this.timeRunning += dt;
            if (this.timeToCall > 0) {
                while (this.timeRunning >= this.timeToCall) {
                    this.callback.call(this.context, this.timeRunning - this.timeToCall);
                    this.timeRunning -= this.timeToCall;
                }
            } else {
                this.callback.call(this.context, dt);
            }
            return false;
        }
    });
})();

(function() {
    Luv.Timer.Tween = Luv.Class("Luv.Timer.Tween", {
        init: function(timeToFinish, subject, to, options) {
            deepParamsCheck(subject, to, []);
            options = options || {};
            this.easing = getEasingFunction(options.easing);
            this.every = options.every || this.every;
            this.after = options.after || this.after;
            this.context = options.context || this;
            this.runningTime = 0;
            this.finished = false;
            this.timeToFinish = timeToFinish;
            this.subject = subject;
            this.from = deepCopy(subject, to);
            this.to = deepCopy(to);
        },
        update: function(dt) {
            if (this.runningTime >= this.timeToFinish) {
                return;
            }
            this.runningTime += dt;
            if (this.runningTime >= this.timeToFinish) {
                this.runningTime = this.timeToFinish;
                this.after.call(this.context);
                this.finished = true;
            }
            this.every.call(this.context, deepEase(this, this.from, this.to));
            return this.finished;
        },
        every: function(values) {
            this.subject = deepMerge(this.subject, values);
        },
        after: function() {},
        isFinished: function() {
            return !!this.finished;
        }
    });
    var linear = function(t, b, c, d) {
        return c * t / d + b;
    }, inQuad = function(t, b, c, d) {
        return c * Math.pow(t / d, 2) + b;
    }, outQuad = function(t, b, c, d) {
        t = t / d;
        return -c * t * (t - 2) + b;
    }, inOutQuad = function(t, b, c, d) {
        t = t / d * 2;
        if (t < 1) {
            return c / 2 * Math.pow(t, 2) + b;
        }
        return -c / 2 * ((t - 1) * (t - 3) - 1) + b;
    }, outInQuad = function(t, b, c, d) {
        if (t < d / 2) {
            return outQuad(t * 2, b, c / 2, d);
        }
        return inQuad(t * 2 - d, b + c / 2, c / 2, d);
    }, inCubic = function(t, b, c, d) {
        return c * Math.pow(t / d, 3) + b;
    }, outCubic = function(t, b, c, d) {
        return c * (Math.pow(t / d - 1, 3) + 1) + b;
    }, inOutCubic = function(t, b, c, d) {
        t = t / d * 2;
        if (t < 1) {
            return c / 2 * t * t * t + b;
        }
        t = t - 2;
        return c / 2 * (t * t * t + 2) + b;
    }, outInCubic = function(t, b, c, d) {
        if (t < d / 2) {
            return outCubic(t * 2, b, c / 2, d);
        }
        return inCubic(t * 2 - d, b + c / 2, c / 2, d);
    }, inQuart = function(t, b, c, d) {
        return c * Math.pow(t / d, 4) + b;
    }, outQuart = function(t, b, c, d) {
        return -c * (Math.pow(t / d - 1, 4) - 1) + b;
    }, inOutQuart = function(t, b, c, d) {
        t = t / d * 2;
        if (t < 1) {
            return c / 2 * Math.pow(t, 4) + b;
        }
        return -c / 2 * (Math.pow(t - 2, 4) - 2) + b;
    }, outInQuart = function(t, b, c, d) {
        if (t < d / 2) {
            return outQuart(t * 2, b, c / 2, d);
        }
        return inQuart(t * 2 - d, b + c / 2, c / 2, d);
    }, inQuint = function(t, b, c, d) {
        return c * Math.pow(t / d, 5) + b;
    }, outQuint = function(t, b, c, d) {
        return c * (Math.pow(t / d - 1, 5) + 1) + b;
    }, inOutQuint = function(t, b, c, d) {
        t = t / d * 2;
        if (t < 1) {
            return c / 2 * Math.pow(t, 5) + b;
        }
        return c / 2 * (Math.pow(t - 2, 5) + 2) + b;
    }, outInQuint = function(t, b, c, d) {
        if (t < d / 2) {
            return outQuint(t * 2, b, c / 2, d);
        }
        return inQuint(t * 2 - d, b + c / 2, c / 2, d);
    }, inSine = function(t, b, c, d) {
        return -c * Math.cos(t / d * (Math.PI / 2)) + c + b;
    }, outSine = function(t, b, c, d) {
        return c * Math.sin(t / d * (Math.PI / 2)) + b;
    }, inOutSine = function(t, b, c, d) {
        return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
    }, outInSine = function(t, b, c, d) {
        if (t < d / 2) {
            return outSine(t * 2, b, c / 2, d);
        }
        return inSine(t * 2 - d, b + c / 2, c / 2, d);
    }, inExpo = function(t, b, c, d) {
        if (t === 0) {
            return b;
        }
        return c * Math.pow(2, 10 * (t / d - 1)) + b - c * .001;
    }, outExpo = function(t, b, c, d) {
        if (t == d) {
            return b + c;
        }
        return c * 1.001 * (-Math.pow(2, -10 * t / d) + 1) + b;
    }, inOutExpo = function(t, b, c, d) {
        if (t === 0) {
            return b;
        }
        if (t == d) {
            return b + c;
        }
        t = t / d * 2;
        if (t < 1) {
            return c / 2 * Math.pow(2, 10 * (t - 1)) + b - c * 5e-4;
        }
        return c / 2 * 1.0005 * (-Math.pow(2, -10 * (t - 1)) + 2) + b;
    }, outInExpo = function(t, b, c, d) {
        if (t < d / 2) {
            return outExpo(t * 2, b, c / 2, d);
        }
        return inExpo(t * 2 - d, b + c / 2, c / 2, d);
    }, inCirc = function(t, b, c, d) {
        return -c * (Math.sqrt(1 - Math.pow(t / d, 2)) - 1) + b;
    }, outCirc = function(t, b, c, d) {
        return c * Math.sqrt(1 - Math.pow(t / d - 1, 2)) + b;
    }, inOutCirc = function(t, b, c, d) {
        t = t / d * 2;
        if (t < 1) {
            return -c / 2 * (Math.sqrt(1 - t * t) - 1) + b;
        }
        t = t - 2;
        return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
    }, outInCirc = function(t, b, c, d) {
        if (t < d / 2) {
            return outCirc(t * 2, b, c / 2, d);
        }
        return inCirc(t * 2 - d, b + c / 2, c / 2, d);
    }, calculatePAS = function(p, a, c, d) {
        p = typeof p === "undefined" ? d * .3 : p;
        a = a || 0;
        if (a < Math.abs(c)) {
            a = c;
            s = p / 4;
        } else {
            s = p / (2 * Math.PI) * Math.asin(c / a);
        }
        return [ p, a, s ];
    }, inElastic = function(t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        t = t / d;
        if (t == 1) {
            return b + c;
        }
        var pas = calculatePAS(p, a, c, d), s = pas[2];
        p = pas[0];
        a = pas[1];
        t = t - 1;
        return -(a * Math.pow(2, 10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p)) + b;
    }, outElastic = function(t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        t = t / d;
        if (t == 1) {
            return b + c;
        }
        var pas = calculatePAS(p, a, c, d), s = pas[2];
        p = pas[0];
        a = pas[1];
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) + c + b;
    }, inOutElastic = function(t, b, c, d, a, p) {
        if (t === 0) {
            return b;
        }
        t = t / d;
        if (t == 1) {
            return b + c;
        }
        var pas = calculatePAS(p, a, c, d), s = pas[2];
        p = pas[0];
        a = pas[1];
        t = t - 1;
        if (t < 0) {
            return -.5 * a * Math.pow(2, 10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) + b;
        }
        return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * 2 * Math.PI / p) * .5 + c + b;
    }, outInElastic = function(t, b, c, d, a, p) {
        if (t < d / 2) {
            return outElastic(t * 2, b, c / 2, d, a, p);
        }
        return inElastic(t * 2 - d, b + c / 2, c / 2, d, a, p);
    }, inBack = function(t, b, c, d, s) {
        s = s || 1.70158;
        t = t / d;
        return c * t * t * ((s + 1) * t - s) + b;
    }, outBack = function(t, b, c, d, s) {
        s = s || 1.70158;
        t = t / d - 1;
        return c * (t * t * ((s + 1) * t + s) + 1) + b;
    }, inOutBack = function(t, b, c, d, s) {
        s = (s || 1.70158) * 1.525;
        t = t / d * 2;
        if (t < 1) {
            return c / 2 * t * t * ((s + 1) * t - s) + b;
        }
        t = t - 2;
        return c / 2 * (t * t * ((s + 1) * t + s) + 2) + b;
    }, outInBack = function(t, b, c, d, s) {
        if (t < d / 2) {
            return outBack(t * 2, b, c / 2, d, s);
        }
        return inBack(t * 2 - d, b + c / 2, c / 2, d, s);
    }, outBounce = function(t, b, c, d) {
        t = t / d;
        if (t < 1 / 2.75) {
            return c * 7.5625 * t * t + b;
        }
        if (t < 2 / 2.75) {
            t = t - 1.5 / 2.75;
            return c * (7.5625 * t * t + .75) + b;
        } else if (t < 2.5 / 2.75) {
            t = t - 2.25 / 2.75;
            return c * (7.5625 * t * t + .9375) + b;
        }
        t = t - 2.625 / 2.75;
        return c * (7.5625 * t * t + .984375) + b;
    }, inBounce = function(t, b, c, d) {
        return c - outBounce(d - t, 0, c, d) + b;
    }, inOutBounce = function(t, b, c, d) {
        if (t < d / 2) {
            return inBounce(t * 2, 0, c, d) * .5 + b;
        }
        return outBounce(t * 2 - d, 0, c, d) * .5 + c * .5 + b;
    }, outInBounce = function(t, b, c, d) {
        if (t < d / 2) {
            return outBounce(t * 2, b, c / 2, d);
        }
        return inBounce(t * 2 - d, b + c / 2, c / 2, d);
    };
    Luv.Timer.Tween.easing = {
        linear: linear,
        inQuad: inQuad,
        outQuad: outQuad,
        inOutQuad: inOutQuad,
        outInQuad: outInQuad,
        inCubic: inCubic,
        outCubic: outCubic,
        inOutCubic: inOutCubic,
        outInCubic: outInCubic,
        inQuart: inQuart,
        outQuart: outQuart,
        inOutQuart: inOutQuart,
        outInQuart: outInQuart,
        inQuint: inQuint,
        outQuint: outQuint,
        inOutQuint: inOutQuint,
        outInQuint: outInQuint,
        inSine: inSine,
        outSine: outSine,
        inOutSine: inOutSine,
        outInSine: outInSine,
        inExpo: inExpo,
        outExpo: outExpo,
        inOutExpo: inOutExpo,
        outInExpo: outInExpo,
        inCirc: inCirc,
        outCirc: outCirc,
        inOutCirc: inOutCirc,
        outInCirc: outInCirc,
        inElastic: inElastic,
        outElastic: outElastic,
        inOutElastic: inOutElastic,
        outInElastic: outInElastic,
        inBack: inBack,
        outBack: outBack,
        inOutBack: inOutBack,
        outInBack: outInBack,
        inBounce: inBounce,
        outBounce: outBounce,
        inOutBounce: inOutBounce,
        outInBounce: outInBounce
    };
    var deepParamsCheck = function(subject, to, path) {
        var toType, newPath;
        for (var k in to) {
            if (to.hasOwnProperty(k)) {
                toType = typeof to[k];
                newPath = path.slice(0);
                newPath.push(String(k));
                if (toType === "number") {
                    if (typeof subject[k] !== "number") {
                        throw new Error("Parameter '" + newPath.join("/") + "' is missing from 'from' or isn't a number");
                    }
                } else if (toType === "object") {
                    deepParamsCheck(subject[k], to[k], newPath);
                } else {
                    throw new Error("Parameter '" + newPath.join("/") + "' must be a number or string, was " + to[k]);
                }
            }
        }
    };
    var deepEase = function(tween, from, to) {
        var result;
        if (typeof to === "object") {
            result = Array.isArray(to) ? [] : {};
            for (var key in to) {
                if (to.hasOwnProperty(key)) {
                    result[key] = deepEase(tween, from[key], to[key]);
                }
            }
        } else {
            result = tween.easing(tween.runningTime, from, to - from, tween.timeToFinish);
        }
        return result;
    };
    var getEasingFunction = function(easing) {
        easing = easing || "linear";
        return typeof easing == "string" ? Luv.Timer.Tween.easing[easing] : easing;
    };
    var deepMerge = function(result, keysObj, valuesObj) {
        valuesObj = valuesObj || keysObj;
        if (typeof keysObj === "object") {
            result = result || (Array.isArray(keysObj) ? [] : {});
            for (var key in keysObj) {
                if (keysObj.hasOwnProperty(key)) {
                    result[key] = deepMerge(result[key], keysObj[key], valuesObj[key]);
                }
            }
        } else {
            result = keysObj;
        }
        return result;
    };
    var deepCopy = function(keysObj, valuesObj) {
        return deepMerge(null, keysObj, valuesObj);
    };
})();

(function() {
    Luv.Keyboard = Luv.Class("Luv.Keyboard", {
        init: function(el) {
            var keyboard = this;
            keyboard.keysDown = {};
            keyboard.el = el;
            el.addEventListener("keydown", function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                var key = getKeyFromEvent(evt);
                keyboard.keysDown[key] = true;
                keyboard.onPressed(key, evt.which);
            });
            el.addEventListener("keyup", function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
                var key = getKeyFromEvent(evt);
                keyboard.keysDown[key] = false;
                keyboard.onReleased(key, evt.which);
            });
            return keyboard;
        },
        onPressed: function(key, code) {},
        onReleased: function(key, code) {},
        isDown: function(key) {
            return !!this.keysDown[key];
        }
    });
    var keys = {
        8: "backspace",
        9: "tab",
        13: "enter",
        16: "shift",
        17: "ctrl",
        18: "alt",
        19: "pause",
        20: "capslock",
        27: "escape",
        33: "pageup",
        34: "pagedown",
        35: "end",
        36: "home",
        45: "insert",
        46: "delete",
        37: "left",
        38: "up",
        39: "right",
        40: "down",
        91: "lmeta",
        92: "rmeta",
        93: "mode",
        96: "kp0",
        97: "kp1",
        98: "kp2",
        99: "kp3",
        100: "kp4",
        101: "kp5",
        102: "kp6",
        103: "kp7",
        104: "kp8",
        105: "kp9",
        106: "kp*",
        107: "kp+",
        109: "kp-",
        110: "kp.",
        111: "kp/",
        112: "f1",
        113: "f2",
        114: "f3",
        115: "f4",
        116: "f5",
        117: "f6",
        118: "f7",
        119: "f8",
        120: "f9",
        121: "f10",
        122: "f11",
        123: "f12",
        144: "numlock",
        145: "scrolllock",
        186: ",",
        187: "=",
        188: ",",
        189: "-",
        190: ".",
        191: "/",
        192: "`",
        219: "[",
        220: "\\",
        221: "]",
        222: "'"
    };
    var shiftedKeys = {
        192: "~",
        48: ")",
        49: "!",
        50: "@",
        51: "#",
        52: "$",
        53: "%",
        54: "^",
        55: "&",
        56: "*",
        57: "(",
        109: "_",
        61: "+",
        219: "{",
        221: "}",
        220: "|",
        59: ":",
        222: '"',
        188: "<",
        189: ">",
        191: "?",
        96: "insert",
        97: "end",
        98: "down",
        99: "pagedown",
        100: "left",
        102: "right",
        103: "home",
        104: "up",
        105: "pageup"
    };
    var rightKeys = {
        16: "rshift",
        17: "rctrl",
        18: "ralt"
    };
    var getKeyFromEvent = function(event) {
        var code = event.which;
        var key;
        if (event.keyLocation && event.keyLocation > 1) {
            key = rightKeys[code];
        } else if (event.shiftKey) {
            key = shiftedKeys[code] || keys[code];
        } else {
            key = keys[code];
        }
        if (typeof key === "undefined") {
            key = String.fromCharCode(code);
            if (event.shiftKey) {
                key = key.toUpperCase();
            }
        }
        return key;
    };
})();

(function() {
    Luv.Mouse = Luv.Class("Luv.Mouse", {
        init: function(el) {
            var mouse = this;
            mouse.x = 0;
            mouse.y = 0;
            mouse.pressedButtons = {};
            mouse.wheelTimeOuts = {};
            var handlePress = function(button) {
                mouse.pressedButtons[button] = true;
                mouse.onPressed(mouse.x, mouse.y, button);
            };
            var handleRelease = function(button) {
                mouse.pressedButtons[button] = false;
                mouse.onReleased(mouse.x, mouse.y, button);
            };
            var handleWheel = function(evt) {
                evt.preventDefault();
                var button = getWheelButtonFromEvent(evt);
                clearTimeout(mouse.wheelTimeOuts[button]);
                mouse.wheelTimeOuts[button] = setTimeout(function() {
                    handleRelease(button);
                }, Luv.Mouse.WHEEL_TIMEOUT * 1e3);
                handlePress(button);
            };
            el.addEventListener("mousemove", function(evt) {
                var rect = el.getBoundingClientRect();
                mouse.x = evt.pageX - rect.left;
                mouse.y = evt.pageY - rect.top;
                mouse.onMoved(mouse.x, mouse.y);
            });
            el.addEventListener("mousedown", function(evt) {
                handlePress(getButtonFromEvent(evt));
            });
            el.addEventListener("mouseup", function(evt) {
                handleRelease(getButtonFromEvent(evt));
            });
            el.addEventListener("DOMMouseScroll", handleWheel);
            el.addEventListener("mousewheel", handleWheel);
        },
        getX: function() {
            return this.x;
        },
        getY: function() {
            return this.y;
        },
        getPosition: function() {
            return {
                x: this.x,
                y: this.y
            };
        },
        onPressed: function(x, y, button) {},
        onReleased: function(x, y, button) {},
        onMoved: function(x, y) {},
        isPressed: function(button) {
            return !!this.pressedButtons[button];
        }
    });
    Luv.Mouse.WHEEL_TIMEOUT = .02;
    var mouseButtonNames = {
        1: "l",
        2: "m",
        3: "r"
    };
    var getButtonFromEvent = function(evt) {
        return mouseButtonNames[evt.which];
    };
    var getWheelButtonFromEvent = function(evt) {
        var delta = Math.max(-1, Math.min(1, evt.wheelDelta || -evt.detail));
        return delta === 1 ? "wu" : "wd";
    };
})();

(function() {
    Luv.Touch = Luv.Class("Luv.Touch", {
        init: function(el) {
            var touch = this;
            touch.fingers = {};
            touch.el = el;
            var preventDefault = function(evt) {
                evt.preventDefault();
                evt.stopPropagation();
            };
            el.addEventListener("gesturestart", preventDefault);
            el.addEventListener("gesturechange", preventDefault);
            el.addEventListener("gestureend", preventDefault);
            el.addEventListener("touchstart", function(evt) {
                preventDefault(evt);
                var t, finger, rect = el.getBoundingClientRect();
                for (var i = 0; i < evt.targetTouches.length; i++) {
                    t = evt.targetTouches[i];
                    finger = getFingerByIdentifier(touch, t.identifier);
                    if (!finger) {
                        finger = {
                            identifier: t.identifier,
                            position: getNextAvailablePosition(touch),
                            x: t.pageX - rect.left,
                            y: t.pageY - rect.top
                        };
                        touch.fingers[finger.position] = finger;
                        touch.onPressed(finger.position, finger.x, finger.y);
                    }
                }
            });
            var touchend = function(evt) {
                preventDefault(evt);
                var t, finger, rect = el.getBoundingClientRect();
                for (var i = 0; i < evt.changedTouches.length; i++) {
                    t = evt.changedTouches[i];
                    finger = getFingerByIdentifier(touch, t.identifier);
                    if (finger) {
                        delete touch.fingers[finger.position];
                        touch.onReleased(finger.position, finger.x, finger.y);
                    }
                }
            };
            el.addEventListener("touchend", touchend);
            el.addEventListener("touchleave", touchend);
            el.addEventListener("touchcancel", touchend);
            el.addEventListener("touchmove", function(evt) {
                preventDefault(evt);
                var t, finger, rect = el.getBoundingClientRect();
                for (var i = 0; i < evt.targetTouches.length; i++) {
                    t = evt.targetTouches[i];
                    finger = getFingerByIdentifier(touch, t.identifier);
                    if (finger) {
                        finger.x = t.pageX - rect.left;
                        finger.y = t.pageY - rect.top;
                        touch.onMoved(finger.position, finger.x, finger.y);
                    }
                }
            });
        },
        onPressed: function(finger, x, y) {},
        onReleased: function(finger, x, y) {},
        onMoved: function(finger, x, y) {},
        isPressed: function(finger) {
            return !!this.fingers[finger];
        },
        getFinger: function(position) {
            var finger = this.fingers[position];
            return finger && {
                position: finger.position,
                identifier: finger.identifier,
                x: finger.x,
                y: finger.y
            };
        },
        getFingers: function() {
            var result = [], positions = Object.keys(this.fingers).sort(), finger, position;
            for (var i = 0; i < positions.length; i++) {
                position = positions[i];
                finger = this.fingers[position];
                result.push({
                    position: position,
                    x: finger.x,
                    y: finger.y
                });
            }
            return result;
        },
        isAvailable: function() {
            return window.ontouchstart !== undefined;
        }
    });
    var getMaxPosition = function(touch) {
        var positions = Object.keys(touch.fingers);
        if (positions.length === 0) {
            return 0;
        }
        return Math.max.apply(Math, positions);
    };
    var getNextAvailablePosition = function(touch) {
        var maxPosition = getMaxPosition(touch);
        for (var i = 1; i < maxPosition; i++) {
            if (!touch.isPressed(i)) {
                return i;
            }
        }
        return maxPosition + 1;
    };
    var getFingerByIdentifier = function(touch, identifier) {
        var fingers = touch.fingers;
        for (var position in fingers) {
            if (fingers.hasOwnProperty(position) && fingers[position].identifier == identifier) {
                return fingers[position];
            }
        }
    };
})();

(function() {
    Luv.Media = Luv.Class("Luv.Media", {
        init: function() {
            this.pending = 0;
            this.loaded = true;
        },
        isLoaded: function() {
            return this.loaded;
        },
        getPending: function() {
            return this.pending;
        },
        onAssetLoaded: function(asset) {},
        onAssetError: function(asset) {
            throw new Error("Could not load " + asset);
        },
        onLoaded: function() {},
        newAsset: function(asset) {
            this.pending++;
            this.loaded = false;
            clearTimeout(this.onLoadedTimeout);
            asset.status = "pending";
        },
        registerLoad: function(asset) {
            this.pending--;
            asset.status = "loaded";
            this.onAssetLoaded(asset);
            if (this.pending === 0) {
                var self = this;
                clearTimeout(this.onLoadedTimeout);
                this.onLoadedTimeout = setTimeout(function() {
                    self.loaded = true;
                    self.onLoaded();
                }, Luv.Timer.ONLOAD_TIMEOUT);
            }
        },
        registerError: function(asset) {
            this.pending--;
            asset.status = "error";
            this.onAssetError(asset);
        }
    });
    Luv.Timer.ONLOAD_TIMEOUT = 200;
    Luv.Media.Asset = {
        isPending: function() {
            return this.status == "pending";
        },
        isLoaded: function() {
            return this.status == "loaded";
        },
        isError: function() {
            return this.status == "error";
        }
    };
})();

(function() {
    Luv.Audio = Luv.Class("Luv.Audio", {
        init: function(media) {
            this.media = media;
        },
        isAvailable: function() {
            return Luv.Audio.isAvailable();
        },
        getSupportedTypes: function() {
            return Luv.Audio.getSupportedTypes();
        },
        canPlayType: function(type) {
            return this.supportedTypes[type.toLowerCase()];
        },
        Sound: function() {
            if (this.isAvailable()) {
                var args = [ this.media ].concat(Array.prototype.slice.call(arguments, 0));
                return Luv.Audio.Sound.apply(Luv.Audio.Sound, args);
            } else {
                return Luv.Audio.NullSound();
            }
        }
    });
    Luv.Audio.isAvailable = function() {
        return audioAvailable;
    };
    Luv.Audio.canPlayType = function(type) {
        return !!supportedTypes[type.toLowerCase()];
    };
    Luv.Audio.getSupportedTypes = function() {
        return Object.keys(supportedTypes);
    };
    var el = document.createElement("audio");
    var supportedTypes = {};
    var audioAvailable = !!el.canPlayType;
    if (audioAvailable) {
        supportedTypes.ogg = !!el.canPlayType('audio/ogg; codecs="vorbis"');
        supportedTypes.mp3 = !!el.canPlayType("audio/mpeg;");
        supportedTypes.wav = !!el.canPlayType('audio/wav; codecs="1"');
        supportedTypes.m4a = !!el.canPlayType("audio/x-m4a;");
        supportedTypes.aac = !!el.canPlayType("audio/aac;");
    }
})();

(function() {
    Luv.Audio.Sound = Luv.Class("Luv.Audio.Sound", {
        init: function(media) {
            var paths = Array.prototype.slice.call(arguments, 1);
            if (paths.length === 0) {
                throw new Error("Must provide at least one path for the Sound");
            }
            paths = paths.filter(isPathExtensionSupported);
            if (paths.length === 0) {
                throw new Error("None of the provided sound types (" + paths.join(", ") + ") is supported by the browser: (" + Luv.Audio.getSupportedTypes().join(", ") + ")");
            }
            var sound = this;
            sound.path = paths[0];
            media.newAsset(sound);
            var el = sound.el = document.createElement("audio");
            el.preload = "auto";
            el.addEventListener("canplaythrough", function() {
                if (sound.isLoaded()) {
                    return;
                }
                media.registerLoad(sound);
            });
            el.addEventListener("error", function() {
                media.registerError(sound);
            });
            el.src = sound.path;
            el.load();
            sound.instances = [];
            sound.expirationTime = Luv.Audio.Sound.DEFAULT_EXPIRATION_TIME;
        },
        toString: function() {
            return 'Luv.Audio.Sound("' + this.path + '")';
        },
        play: function(options) {
            if (!this.isLoaded()) {
                throw new Error("Attepted to play a non loaded sound: " + this);
            }
            var instance = this.getReadyInstance(options);
            instance.play();
            return instance;
        },
        pause: function() {
            this.instances.forEach(function(instance) {
                instance.pause();
            });
        },
        stop: function() {
            this.instances.forEach(function(instance) {
                instance.stop();
            });
        },
        countInstances: function() {
            return this.instances.length;
        },
        countPlayingInstances: function() {
            var count = 0;
            this.instances.forEach(function(inst) {
                count += inst.isPlaying() ? 1 : 0;
            });
            return count;
        },
        getReadyInstance: function(options) {
            var instance = getExistingReadyInstance(this.instances);
            if (!instance) {
                instance = createInstance(this);
                this.instances.push(instance);
            }
            instance.reset(this.el, options);
            return instance;
        },
        getExpirationTime: function() {
            return this.expirationTime;
        },
        setExpirationTime: function(seconds) {
            this.expirationTime = seconds;
        }
    });
    Luv.Audio.Sound.DEFAULT_EXPIRATION_TIME = 3;
    Luv.Audio.Sound.include(Luv.Media.Asset);
    Luv.Audio.SoundMethods = {
        setVolume: function(volume) {
            volume = clampNumber(volume, 0, 1);
            this.el.volume = volume;
        },
        getVolume: function() {
            return this.el.volume;
        },
        setLoop: function(loop) {
            this.loop = !!loop;
            if (loop) {
                this.el.loop = "loop";
            } else {
                this.el.removeAttribute("loop");
            }
        },
        getLoop: function() {
            return this.loop;
        },
        setSpeed: function(speed) {
            this.el.playbackRate = speed;
        },
        getSpeed: function() {
            return this.el.playbackRate;
        },
        setTime: function(time) {
            try {
                this.el.currentTime = time;
            } catch (err) {}
        },
        getTime: function() {
            return this.el.currentTime;
        },
        getDuration: function() {
            return this.el.duration;
        }
    };
    Luv.Audio.Sound.include(Luv.Audio.SoundMethods);
    var getExistingReadyInstance = function(instances) {
        var instance;
        for (var i = 0; i < instances.length; i++) {
            instance = instances[i];
            if (instance.isReady()) {
                return instance;
            }
        }
    };
    var createInstance = function(sound) {
        return Luv.Audio.SoundInstance(sound.el.cloneNode(true), function() {
            clearTimeout(this.expirationTimeOut);
        }, function() {
            var instance = this;
            instance.expirationTimeOut = setTimeout(function() {
                removeInstance(sound, instance);
            }, sound.getExpirationTime() * 1e3);
        });
    };
    var removeInstance = function(sound, instance) {
        var index = sound.instances.indexOf(instance);
        if (index != -1) {
            sound.instances.splice(index, 1);
        }
    };
    var getExtension = function(path) {
        var match = path.match(/.+\.([^?]+)(\?|$)/);
        return match ? match[1].toLowerCase() : "";
    };
    var isPathExtensionSupported = function(path) {
        return Luv.Audio.canPlayType(getExtension(path));
    };
    var clampNumber = function(x, min, max) {
        return Math.max(min, Math.min(max, Number(x)));
    };
})();

(function() {
    Luv.Audio.SoundInstance = Luv.Class("Luv.Audio.SoundInstance", {
        init: function(el, onPlay, onStop) {
            var instance = this;
            instance.el = el;
            instance.onPlay = onPlay;
            instance.onStop = onStop;
            instance.el.addEventListener("ended", function() {
                instance.stop();
            });
        },
        reset: function(soundEl, options) {
            options = options || {};
            var volume = typeof options.volume === "undefined" ? soundEl.volume : options.volume, loop = typeof options.loop === "undefined" ? !!soundEl.loop : options.loop, speed = typeof options.speed === "undefined" ? soundEl.playbackRate : options.speed, time = typeof options.time === "undefined" ? soundEl.currentTime : options.time, status = typeof options.status === "undefined" ? "ready" : options.status;
            this.setVolume(volume);
            this.setLoop(loop);
            this.setSpeed(speed);
            this.setTime(time);
            this.status = status;
        },
        play: function() {
            this.el.play();
            this.status = "playing";
            this.onPlay();
        },
        pause: function() {
            if (this.isPlaying()) {
                this.el.pause();
                this.status = "paused";
            }
        },
        stop: function() {
            this.el.pause();
            this.setTime(0);
            this.status = "ready";
            this.onStop();
        },
        isPaused: function() {
            return this.status == "paused";
        },
        isReady: function() {
            return this.status == "ready";
        },
        isPlaying: function() {
            return this.status == "playing";
        },
        onPlay: function() {},
        onStop: function() {}
    });
    Luv.Audio.SoundInstance.include(Luv.Audio.SoundMethods);
})();

(function() {
    Luv.Audio.NullSound = Luv.Class("Luv.Audio.NullSound");
    var fakeMethods = {}, fakeMethod = function() {
        return 0;
    };
    for (var name in Luv.Audio.Sound.methods) {
        if (Luv.Audio.Sound.methods.hasOwnProperty(name)) {
            fakeMethods[name] = fakeMethod;
        }
    }
    Luv.Audio.NullSound.include(fakeMethods, {
        play: function() {
            return Luv.Audio.SoundInstance(FakeAudioElement());
        }
    });
    var FakeAudioElement = function() {
        return {
            volume: 1,
            playbackRate: 1,
            loop: undefined,
            currentTime: 0,
            play: function() {},
            pause: function() {},
            addEventListener: function(ignored, f) {
                f();
            }
        };
    };
})();

(function() {
    Luv.Graphics = Luv.Class("Luv.Graphics", {
        init: function(el, media) {
            this.el = el;
            this.media = media;
            this.color = {};
            this.backgroundColor = {};
            this.alpha = 1;
            this.lineCap = "butt";
            this.lineWidth = 1;
            this.imageSmoothing = true;
            var d = this.getDimensions();
            this.defaultCanvas = this.Canvas(d.width, d.height);
            this.defaultCanvas.el = el;
            this.setCanvas();
            this.setBackgroundColor(0, 0, 0);
            this.setColor(255, 255, 255);
            this.setAlpha(1);
        },
        setCanvas: function(canvas) {
            canvas = canvas || this.defaultCanvas;
            this.canvas = canvas;
            this.el = canvas.el;
            this.ctx = canvas.getContext();
            resetCanvas(this, this.ctx);
        },
        getCanvas: function() {
            return this.canvas;
        },
        clear: function() {
            this.ctx.save();
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.globalAlpha = 1;
            this.ctx.fillStyle = this.backgroundColorStyle;
            this.ctx.fillRect(0, 0, this.getWidth(), this.getHeight());
            this.ctx.restore();
        },
        setColor: function(r, g, b) {
            setColor(this, "color", r, g, b);
        },
        getColor: function() {
            return getColor(this.color);
        },
        parseColor: function(r, g, b) {
            return Luv.Graphics.parseColor(r, g, b);
        },
        setAlpha: function(alpha) {
            this.alpha = clampNumber(alpha, 0, 1);
            this.ctx.globalAlpha = this.alpha;
        },
        getAlpha: function() {
            return this.alpha;
        },
        setBackgroundColor: function(r, g, b) {
            setColor(this, "backgroundColor", r, g, b);
        },
        getBackgroundColor: function() {
            return getColor(this.backgroundColor);
        },
        getWidth: function() {
            return Number(this.el.getAttribute("width"));
        },
        getHeight: function() {
            return Number(this.el.getAttribute("height"));
        },
        getDimensions: function() {
            return {
                width: this.getWidth(),
                height: this.getHeight()
            };
        },
        setDimensions: function(width, height) {
            this.el.setAttribute("width", width);
            this.el.setAttribute("height", height);
        },
        setLineWidth: function(width) {
            this.lineWidth = width;
            this.ctx.lineWidth = width;
        },
        getLineWidth: function() {
            return this.lineWidth;
        },
        setLineCap: function(cap) {
            if (cap != "butt" && cap != "round" && cap != "square") {
                throw new Error("Line cap must be either 'butt', 'round' or 'square' (was: " + cap + ")");
            }
            this.ctx.lineCap = cap;
            this.lineCap = this.ctx.lineCap;
        },
        getLineCap: function() {
            return this.lineCap;
        },
        setImageSmoothing: function(smoothing) {
            this.imageSmoothing = smoothing = !!smoothing;
            setImageSmoothing(this.ctx, smoothing);
        },
        getImageSmoothing: function() {
            return this.imageSmoothing;
        },
        print: function(str, x, y) {
            this.ctx.fillStyle = this.colorStyle;
            this.ctx.fillText(str, x, y);
        },
        line: function() {
            var coords = Array.isArray(arguments[0]) ? arguments[0] : arguments;
            this.ctx.beginPath();
            drawPolyLine(this, "luv.graphics.line", 4, coords);
            drawPath(this, MODE.STROKE);
        },
        strokeRectangle: function(left, top, width, height) {
            rectangle(this, MODE.STROKE, left, top, width, height);
        },
        fillRectangle: function(left, top, width, height) {
            rectangle(this, MODE.FILL, left, top, width, height);
        },
        strokePolygon: function() {
            polygon(this, MODE.STROKE, arguments);
        },
        fillPolygon: function() {
            polygon(this, MODE.FILL, arguments);
        },
        strokeCircle: function(x, y, radius) {
            circle(this, MODE.STROKE, x, y, radius);
        },
        fillCircle: function(x, y, radius) {
            circle(this, MODE.FILL, x, y, radius);
        },
        strokeArc: function(x, y, radius, startAngle, endAngle) {
            arc(this, MODE.STROKE, x, y, radius, startAngle, endAngle);
        },
        fillArc: function(x, y, radius, startAngle, endAngle) {
            arc(this, MODE.FILL, x, y, radius, startAngle, endAngle);
        },
        draw: function(drawable, x, y, angle, sx, sy, ox, oy) {
            var ctx = this.ctx;
            x = getDefaultValue(x, 0);
            y = getDefaultValue(y, 0);
            angle = normalizeAngle(getDefaultValue(angle, 0));
            sx = getDefaultValue(sx, 1);
            sy = getDefaultValue(sy, 1);
            ox = getDefaultValue(ox, 0);
            oy = getDefaultValue(oy, 0);
            if (angle !== 0 || sx !== 1 || sy !== 1 || ox !== 0 || oy !== 0) {
                ctx.save();
                ctx.translate(x, y);
                ctx.translate(ox, oy);
                ctx.rotate(angle);
                ctx.scale(sx, sy);
                ctx.translate(-ox, -oy);
                drawable.draw(this, 0, 0);
                ctx.restore();
            } else {
                drawable.draw(this, x, y);
            }
        },
        drawCentered: function(drawable, x, y, angle, sx, sy) {
            var c = drawable.getCenter();
            this.draw(drawable, x - c.x, y - c.y, angle, sx, sy, c.x, c.y);
        },
        translate: function(x, y) {
            this.ctx.translate(x, y);
        },
        scale: function(sx, sy) {
            this.ctx.scale(sx, sy);
        },
        rotate: function(angle) {
            this.ctx.rotate(angle);
        },
        push: function() {
            this.ctx.save();
        },
        pop: function() {
            this.ctx.restore();
        },
        Canvas: function(width, height) {
            return Luv.Graphics.Canvas(width || this.getWidth(), height || this.getHeight());
        },
        Image: function(path) {
            return Luv.Graphics.Image(this.media, path);
        },
        Sprite: function(image, l, t, w, h) {
            return Luv.Graphics.Sprite(image, l, t, w, h);
        },
        SpriteSheet: function(image, w, h, l, t, b) {
            return Luv.Graphics.SpriteSheet(image, w, h, l, t, b);
        }
    });
    Luv.Graphics.parseColor = function(r, g, b) {
        var m, p = parseInt;
        if (Array.isArray(r)) {
            return {
                r: r[0],
                g: r[1],
                b: r[2]
            };
        }
        if (typeof r === "object") {
            return {
                r: r.r,
                g: r.g,
                b: r.b
            };
        }
        if (typeof r === "string") {
            r = r.replace(/#|\s+/g, "");
            m = /^([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(r);
            if (m) {
                return {
                    r: p(m[1], 16),
                    g: p(m[2], 16),
                    b: p(m[3], 16)
                };
            }
            m = /^([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(r);
            if (m) {
                return {
                    r: p(m[1], 16) * 17,
                    g: p(m[2], 16) * 17,
                    b: p(m[3], 16) * 17
                };
            }
            m = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(r);
            if (m) {
                return {
                    r: p(m[1], 10),
                    g: p(m[2], 10),
                    b: p(m[3], 10)
                };
            }
        }
        return {
            r: r,
            g: g,
            b: b
        };
    };
    var twoPI = Math.PI * 2;
    var setColor = function(self, name, r, g, b) {
        var color = self[name], newColor = Luv.Graphics.parseColor(r, g, b);
        Luv.extend(color, newColor);
        self[name + "Style"] = "rgb(" + [ color.r, color.g, color.b ].join() + ")";
    };
    var getColor = function(color) {
        return {
            r: color.r,
            g: color.g,
            b: color.b
        };
    };
    var drawPolyLine = function(graphics, methodName, minLength, coords) {
        if (coords.length < minLength) {
            throw new Error(methodName + " requires at least 4 parameters");
        }
        if (coords.length % 2 == 1) {
            throw new Error(methodName + " requires an even number of parameters");
        }
        graphics.ctx.moveTo(coords[0], coords[1]);
        for (var i = 2; i < coords.length; i = i + 2) {
            graphics.ctx.lineTo(coords[i], coords[i + 1]);
        }
        graphics.ctx.stroke();
    };
    var normalizeAngle = function(angle) {
        angle = angle % twoPI;
        return angle < 0 ? angle + twoPI : angle;
    };
    var resetCanvas = function(graphics, ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        setImageSmoothing(ctx, graphics.getImageSmoothing());
        ctx.lineWidth = graphics.getLineWidth();
        ctx.lineCap = graphics.getLineCap();
        ctx.globalAlpha = graphics.getAlpha();
    };
    var setImageSmoothing = function(ctx, smoothing) {
        ctx.webkitImageSmoothingEnabled = smoothing;
        ctx.mozImageSmoothingEnabled = smoothing;
        ctx.imageSmoothingEnabled = smoothing;
    };
    var drawPath = function(graphics, mode) {
        switch (mode) {
          case MODE.FILL:
            graphics.ctx.fillStyle = graphics.colorStyle;
            graphics.ctx.fill();
            break;

          case MODE.STROKE:
            graphics.ctx.strokeStyle = graphics.colorStyle;
            graphics.ctx.stroke();
            break;

          default:
            throw new Error("Invalid mode: [" + mode + ']. Should be "fill" or "line"');
        }
    };
    var rectangle = function(graphics, mode, left, top, width, height) {
        graphics.ctx.beginPath();
        graphics.ctx.rect(left, top, width, height);
        drawPath(graphics, mode);
        graphics.ctx.closePath();
    };
    var polygon = function(graphics, mode, args) {
        var coordinates = Array.isArray(args[0]) ? args[0] : Array.prototype.slice.call(args, 0);
        graphics.ctx.beginPath();
        drawPolyLine(graphics, "luv.graphics.polygon", 6, coordinates);
        drawPath(graphics, mode);
        graphics.ctx.closePath();
    };
    var arc = function(graphics, mode, x, y, radius, startAngle, endAngle) {
        graphics.ctx.beginPath();
        graphics.ctx.arc(x, y, radius, startAngle, endAngle, false);
        drawPath(graphics, mode);
    };
    var circle = function(graphics, mode, x, y, radius) {
        arc(graphics, mode, x, y, radius, 0, twoPI);
        graphics.ctx.closePath();
    };
    var MODE = {
        STROKE: 1,
        FILL: 2
    };
    var getDefaultValue = function(variable, defaultValue) {
        return typeof variable === "undefined" ? defaultValue : variable;
    };
    var clampNumber = function(x, min, max) {
        return Math.max(min, Math.min(max, Number(x)));
    };
})();

(function() {
    Luv.Graphics.Animation = Luv.Class("Luv.Graphics.Animation", {
        init: function(sprites, durations) {
            if (!Array.isArray(sprites)) {
                throw new Error("Array of sprites needed. Got " + sprites);
            }
            if (sprites.length === 0) {
                throw new Error("No sprites where provided. Must provide at least one");
            }
            this.sprites = sprites.slice(0);
            this.time = 0;
            this.index = 0;
            this.durations = parseDurations(sprites.length, durations);
            this.intervals = calculateIntervals(this.durations);
            this.loopDuration = this.intervals[this.intervals.length - 1];
        },
        update: function(dt) {
            var loops;
            this.time += dt;
            loops = Math.floor(this.time / this.loopDuration);
            this.time -= this.loopDuration * loops;
            if (loops !== 0) {
                this.onLoopEnded(loops);
            }
            this.index = findSpriteIndexByTime(this.intervals, this.time);
        },
        gotoSprite: function(newSpriteIndex) {
            this.index = newSpriteIndex;
            this.time = this.intervals[newSpriteIndex];
        },
        getCurrentSprite: function() {
            return this.sprites[this.index];
        },
        onLoopEnded: function(how_many) {}
    });
    "getWidth getHeight getDimensions getCenter draw".split(" ").forEach(function(method) {
        Luv.Graphics.Animation.methods[method] = function() {
            var sprite = this.getCurrentSprite();
            return sprite[method].apply(sprite, arguments);
        };
    });
    var calculateIntervals = function(durations) {
        var result = [ 0 ], time = 0;
        for (var i = 0; i < durations.length; i++) {
            time += durations[i];
            result.push(time);
        }
        return result;
    };
    var findSpriteIndexByTime = function(frames, time) {
        var high = frames.length - 2, low = 0, i = 0;
        while (low <= high) {
            i = Math.floor((low + high) / 2);
            if (time >= frames[i + 1]) {
                low = i + 1;
                continue;
            }
            if (time < frames[i]) {
                high = i - 1;
                continue;
            }
            break;
        }
        return i;
    };
    var parseDurations = function(length, durations) {
        var result = [], r, i, range, value;
        if (Array.isArray(durations)) {
            result = durations.slice(0);
        } else if (typeof durations == "object") {
            result.length = length;
            for (r in durations) {
                if (durations.hasOwnProperty(r)) {
                    range = parseRange(r);
                    value = Number(durations[r]);
                    for (i = 0; i < range.length; i++) {
                        result[range[i]] = value;
                    }
                }
            }
        } else {
            durations = Number(durations);
            for (i = 0; i < length; i++) {
                result.push(durations);
            }
        }
        if (result.length != length) {
            throw new Error("The durations table length should be " + length + ", but it is " + result.length);
        }
        for (i = 0; i < result.length; i++) {
            if (typeof result[i] === "undefined") {
                throw new Error("Missing delay for sprite " + i);
            }
            if (isNaN(result[i])) {
                throw new Error("Could not parse the delay for sprite " + i);
            }
        }
        return result;
    };
    var parseRange = function(r) {
        var match, result, start, end, i;
        if (typeof r != "string") {
            throw new Error("Unknown range type (must be integer or string in the form 'start-end'): " + r);
        }
        match = r.match(/^(\d+)-(\d+)$/);
        if (match) {
            result = [];
            start = Number(match[1]);
            end = Number(match[2]);
            if (start < end) {
                for (i = start; i <= end; i++) {
                    result.push(i);
                }
            } else {
                for (i = start; i >= end; i--) {
                    result.push(i);
                }
            }
        } else {
            result = [ Number(r) ];
        }
        return result;
    };
})();

(function() {
    Luv.Graphics.Canvas = Luv.Class("Luv.Graphics.Canvas", {
        init: function(width, height) {
            var el = document.createElement("canvas");
            el.setAttribute("width", width);
            el.setAttribute("height", height);
            this.el = el;
        },
        getContext: function() {
            return this.el.getContext("2d");
        },
        getWidth: function() {
            return Number(this.el.getAttribute("width"));
        },
        getHeight: function() {
            return Number(this.el.getAttribute("height"));
        },
        getDimensions: function() {
            return {
                width: this.getWidth(),
                height: this.getHeight()
            };
        },
        getCenter: function() {
            return {
                x: this.getWidth() / 2,
                y: this.getHeight() / 2
            };
        },
        setDimensions: function(width, height) {
            this.el.setAttribute("width", width);
            this.el.setAttribute("height", height);
        },
        draw: function(graphics, x, y) {
            graphics.ctx.drawImage(this.el, x, y);
        }
    });
})();

(function() {
    Luv.Graphics.Image = Luv.Class("Luv.Graphics.Image", {
        init: function(media, path) {
            var image = this;
            image.path = path;
            media.newAsset(image);
            var source = new Image();
            image.source = source;
            source.addEventListener("load", function() {
                media.registerLoad(image);
            });
            source.addEventListener("error", function() {
                media.registerError(image);
            });
            source.src = path;
        },
        toString: function() {
            return 'instance of Luv.Graphics.Image("' + this.path + '")';
        },
        getWidth: function() {
            return this.source.width;
        },
        getHeight: function() {
            return this.source.height;
        },
        getDimensions: function() {
            return {
                width: this.source.width,
                height: this.source.height
            };
        },
        getCenter: function() {
            return {
                x: this.source.width / 2,
                y: this.source.height / 2
            };
        },
        draw: function(graphics, x, y) {
            if (!this.isLoaded()) {
                throw new Error("Attepted to draw a non loaded image: " + this);
            }
            graphics.ctx.drawImage(this.source, x, y);
        }
    });
    Luv.Graphics.Image.include(Luv.Media.Asset);
})();

(function() {
    Luv.Graphics.Sprite = Luv.Class("Luv.Graphics.Sprite", {
        init: function(image, l, t, w, h) {
            this.image = image;
            this.l = l;
            this.t = t;
            this.w = w;
            this.h = h;
        },
        toString: function() {
            return "instance of Luv.Graphics.Sprite(" + this.image + ", " + this.l + ", " + this.t + ", " + this.w + ", " + this.h + ")";
        },
        getImage: function() {
            return this.image;
        },
        getWidth: function() {
            return this.w;
        },
        getHeight: function() {
            return this.h;
        },
        getDimensions: function() {
            return {
                width: this.w,
                height: this.h
            };
        },
        getCenter: function() {
            return {
                x: this.w / 2,
                y: this.h / 2
            };
        },
        getBoundingBox: function() {
            return {
                left: this.l,
                top: this.t,
                width: this.w,
                height: this.h
            };
        },
        draw: function(graphics, x, y) {
            if (!this.image.isLoaded()) {
                throw new Error("Attepted to draw a prite of a non loaded image: " + this);
            }
            graphics.ctx.drawImage(this.image.source, this.l, this.t, this.w, this.h, x, y, this.w, this.h);
        }
    });
})();

(function() {
    Luv.Graphics.SpriteSheet = Luv.Class("Luv.Graphics.SpriteSheet", {
        init: function(image, width, height, left, top, border) {
            this.image = image;
            this.width = width;
            this.height = height;
            this.left = left || 0;
            this.top = top || 0;
            this.border = border || 0;
        },
        getSprites: function() {
            var result = [], xCoords, yCoords;
            for (var i = 0; i < arguments.length; i += 2) {
                xCoords = parseRange(arguments[i]);
                yCoords = parseRange(arguments[i + 1]);
                for (var iy = 0; iy < yCoords.length; iy++) {
                    for (var ix = 0; ix < xCoords.length; ix++) {
                        result.push(this.Sprite(xCoords[ix], yCoords[iy]));
                    }
                }
            }
            return result;
        },
        Sprite: function(x, y) {
            return Luv.Graphics.Sprite(this.image, this.left + this.width * x + this.border * (x + 1), this.top + this.height * y + this.border * (y + 1), this.width, this.height);
        },
        Animation: function(spriteInfo, delays) {
            var sprites = this.getSprites.apply(this, spriteInfo);
            return Luv.Graphics.Animation(sprites, delays);
        }
    });
    var parseRange = function(r) {
        if (typeof r == "number") {
            return [ r ];
        }
        if (typeof r == "string") {
            var split = r.split("-");
            if (split.length != 2) {
                throw new Error("Could not parse from '" + r + "'. Must be of the form 'start-end'");
            }
            var result = [], start = Number(split[0]), end = Number(split[1]), i;
            if (start < end) {
                for (i = start; i <= end; i++) {
                    result.push(i);
                }
            } else {
                for (i = start; i >= end; i--) {
                    result.push(i);
                }
            }
            return result;
        }
        throw new Error("Ranges must be integers or strings of the form 'start-end'. Got " + r);
    };
})();