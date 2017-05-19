"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var object_path_1 = require("object-path");
exports.deepGet = object_path_1.get;
var Map = (function () {
    function Map() {
        this.__map__ = {};
        this.size = 0;
    }
    Map.prototype.forEach = function (callback) {
        var _this = this;
        Object.keys(this.__map__).forEach(function (key) {
            var value = _this.__map__[key];
            callback(value, key);
        });
    };
    Map.prototype.has = function (key) {
        return this.__map__[key] !== undefined;
    };
    Map.prototype.get = function (key) {
        return this.__map__[key];
    };
    Map.prototype.set = function (key, value) {
        this.__map__[key] = value;
        this.size = Object.keys(this.__map__).length;
    };
    Map.prototype.delete = function (key) {
        delete this.__map__[key];
        this.size = Object.keys(this.__map__).length;
    };
    return Map;
}());
exports.Map = Map;
function values(obj) {
    return Object.keys(obj).map(function (k) { return obj[k]; });
}
exports.values = values;
