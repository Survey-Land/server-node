"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseValue = parseValue;
exports.processFilters = processFilters;
exports.parseInclude = parseInclude;
function parseValue(value) {
    if (!isNaN(value))
        return Number(value);
    if (typeof value === 'string') {
        const v = value.toLowerCase();
        if (v === 'true')
            return true;
        if (v === 'false')
            return false;
        if (v === 'null')
            return null;
    }
    return value;
}
function processFilters(filters) {
    const out = {};
    for (const key in filters) {
        const val = filters[key];
        if (typeof val === 'object' && !Array.isArray(val)) {
            out[key] = {};
            for (const op in val)
                out[key][op] = parseValue(val[op]);
        }
        else {
            out[key] = typeof val === 'string'
                ? { contains: val, mode: 'insensitive' }
                : parseValue(val);
        }
    }
    return out;
}
function parseInclude(include) {
    const rec = (o) => {
        if (typeof o === 'string') {
            const v = o.toLowerCase();
            if (v === 'true')
                return true;
            if (v === 'false')
                return false;
            return o;
        }
        if (o && typeof o === 'object') {
            for (const k in o)
                o[k] = rec(o[k]);
        }
        return o;
    };
    return rec(include);
}
