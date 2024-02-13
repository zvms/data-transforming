'use strict';

var sqlite3 = require('sqlite3');
var path = require('path');
var fs = require('fs');
var mongodb = require('mongodb');
var require$$0 = require('crypto');
var require$$1 = require('buffer');
var promises = require('fs/promises');
var bcrypt = require('bcrypt');

function connectToSqlite() {
  const pth = path.resolve("database", "zvms.db");
  return new sqlite3.Database(pth);
}

const tables = [
  "volunteer",
  "user",
  "class",
  "class_vol",
  "user_vol",
  "picture",
  "issue",
  "notice",
  "user_notice",
  "class_notice",
];

function exportTables(
  db
) {
  const promises = tables.map((table) => {
    return new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${table}`, (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve({
          key: table,
          value: rows,
        } );
      });
    });
  }) ;
  return Promise.all(promises);
}

async function exportToJSON() {
  const db = connectToSqlite();
  const folder = path.resolve("data", "export");
  const tables = await exportTables(db);
  tables.forEach((table) => {
    console.log("Exporting table", table.key);
    fs.writeFileSync(
      path.resolve(folder, table.key + ".json"),
      JSON.stringify(table.value, null, 2)
    );
  });
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var md5 = {exports: {}};

/**
 * [js-md5]{@link https://github.com/emn178/js-md5}
 *
 * @namespace md5
 * @version 0.8.3
 * @author Chen, Yi-Cyuan [emn178@gmail.com]
 * @copyright Chen, Yi-Cyuan 2014-2023
 * @license MIT
 */
(function (module) {
  (function () {

    var INPUT_ERROR = 'input is invalid type';
    var FINALIZE_ERROR = 'finalize already called';
    var WINDOW = typeof window === 'object';
    var root = WINDOW ? window : {};
    if (root.JS_MD5_NO_WINDOW) {
      WINDOW = false;
    }
    var WEB_WORKER = !WINDOW && typeof self === 'object';
    var NODE_JS = !root.JS_MD5_NO_NODE_JS && typeof process === 'object' && process.versions && process.versions.node;
    if (NODE_JS) {
      root = commonjsGlobal;
    } else if (WEB_WORKER) {
      root = self;
    }
    var COMMON_JS = !root.JS_MD5_NO_COMMON_JS && 'object' === 'object' && module.exports;
    var ARRAY_BUFFER = !root.JS_MD5_NO_ARRAY_BUFFER && typeof ArrayBuffer !== 'undefined';
    var HEX_CHARS = '0123456789abcdef'.split('');
    var EXTRA = [128, 32768, 8388608, -2147483648];
    var SHIFT = [0, 8, 16, 24];
    var OUTPUT_TYPES = ['hex', 'array', 'digest', 'buffer', 'arrayBuffer', 'base64'];
    var BASE64_ENCODE_CHAR = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');
    var blocks = [],
      buffer8;
    if (ARRAY_BUFFER) {
      var buffer = new ArrayBuffer(68);
      buffer8 = new Uint8Array(buffer);
      blocks = new Uint32Array(buffer);
    }
    var isArray = Array.isArray;
    if (root.JS_MD5_NO_NODE_JS || !isArray) {
      isArray = function (obj) {
        return Object.prototype.toString.call(obj) === '[object Array]';
      };
    }
    var isView = ArrayBuffer.isView;
    if (ARRAY_BUFFER && (root.JS_MD5_NO_ARRAY_BUFFER_IS_VIEW || !isView)) {
      isView = function (obj) {
        return typeof obj === 'object' && obj.buffer && obj.buffer.constructor === ArrayBuffer;
      };
    }

    // [message: string, isString: bool]
    var formatMessage = function (message) {
      var type = typeof message;
      if (type === 'string') {
        return [message, true];
      }
      if (type !== 'object' || message === null) {
        throw new Error(INPUT_ERROR);
      }
      if (ARRAY_BUFFER && message.constructor === ArrayBuffer) {
        return [new Uint8Array(message), false];
      }
      if (!isArray(message) && !isView(message)) {
        throw new Error(INPUT_ERROR);
      }
      return [message, false];
    };

    /**
     * @method hex
     * @memberof md5
     * @description Output hash as hex string
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {String} Hex string
     * @example
     * md5.hex('The quick brown fox jumps over the lazy dog');
     * // equal to
     * md5('The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method digest
     * @memberof md5
     * @description Output hash as bytes array
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {Array} Bytes array
     * @example
     * md5.digest('The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method array
     * @memberof md5
     * @description Output hash as bytes array
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {Array} Bytes array
     * @example
     * md5.array('The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method arrayBuffer
     * @memberof md5
     * @description Output hash as ArrayBuffer
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {ArrayBuffer} ArrayBuffer
     * @example
     * md5.arrayBuffer('The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method buffer
     * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
     * @memberof md5
     * @description Output hash as ArrayBuffer
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {ArrayBuffer} ArrayBuffer
     * @example
     * md5.buffer('The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method base64
     * @memberof md5
     * @description Output hash as base64 string
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {String} base64 string
     * @example
     * md5.base64('The quick brown fox jumps over the lazy dog');
     */
    var createOutputMethod = function (outputType) {
      return function (message) {
        return new Md5(true).update(message)[outputType]();
      };
    };

    /**
     * @method create
     * @memberof md5
     * @description Create Md5 object
     * @returns {Md5} Md5 object.
     * @example
     * var hash = md5.create();
     */
    /**
     * @method update
     * @memberof md5
     * @description Create and update Md5 object
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {Md5} Md5 object.
     * @example
     * var hash = md5.update('The quick brown fox jumps over the lazy dog');
     * // equal to
     * var hash = md5.create();
     * hash.update('The quick brown fox jumps over the lazy dog');
     */
    var createMethod = function () {
      var method = createOutputMethod('hex');
      if (NODE_JS) {
        method = nodeWrap(method);
      }
      method.create = function () {
        return new Md5();
      };
      method.update = function (message) {
        return method.create().update(message);
      };
      for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
        var type = OUTPUT_TYPES[i];
        method[type] = createOutputMethod(type);
      }
      return method;
    };
    var nodeWrap = function (method) {
      var crypto = require$$0;
      var Buffer = require$$1.Buffer;
      var bufferFrom;
      if (Buffer.from && !root.JS_MD5_NO_BUFFER_FROM) {
        bufferFrom = Buffer.from;
      } else {
        bufferFrom = function (message) {
          return new Buffer(message);
        };
      }
      var nodeMethod = function (message) {
        if (typeof message === 'string') {
          return crypto.createHash('md5').update(message, 'utf8').digest('hex');
        } else {
          if (message === null || message === undefined) {
            throw new Error(INPUT_ERROR);
          } else if (message.constructor === ArrayBuffer) {
            message = new Uint8Array(message);
          }
        }
        if (isArray(message) || isView(message) || message.constructor === Buffer) {
          return crypto.createHash('md5').update(bufferFrom(message)).digest('hex');
        } else {
          return method(message);
        }
      };
      return nodeMethod;
    };

    /**
     * @namespace md5.hmac
     */
    /**
     * @method hex
     * @memberof md5.hmac
     * @description Output hash as hex string
     * @param {String|Array|Uint8Array|ArrayBuffer} key key
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {String} Hex string
     * @example
     * md5.hmac.hex('key', 'The quick brown fox jumps over the lazy dog');
     * // equal to
     * md5.hmac('key', 'The quick brown fox jumps over the lazy dog');
     */

    /**
     * @method digest
     * @memberof md5.hmac
     * @description Output hash as bytes array
     * @param {String|Array|Uint8Array|ArrayBuffer} key key
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {Array} Bytes array
     * @example
     * md5.hmac.digest('key', 'The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method array
     * @memberof md5.hmac
     * @description Output hash as bytes array
     * @param {String|Array|Uint8Array|ArrayBuffer} key key
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {Array} Bytes array
     * @example
     * md5.hmac.array('key', 'The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method arrayBuffer
     * @memberof md5.hmac
     * @description Output hash as ArrayBuffer
     * @param {String|Array|Uint8Array|ArrayBuffer} key key
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {ArrayBuffer} ArrayBuffer
     * @example
     * md5.hmac.arrayBuffer('key', 'The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method buffer
     * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
     * @memberof md5.hmac
     * @description Output hash as ArrayBuffer
     * @param {String|Array|Uint8Array|ArrayBuffer} key key
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {ArrayBuffer} ArrayBuffer
     * @example
     * md5.hmac.buffer('key', 'The quick brown fox jumps over the lazy dog');
     */
    /**
     * @method base64
     * @memberof md5.hmac
     * @description Output hash as base64 string
     * @param {String|Array|Uint8Array|ArrayBuffer} key key
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {String} base64 string
     * @example
     * md5.hmac.base64('key', 'The quick brown fox jumps over the lazy dog');
     */
    var createHmacOutputMethod = function (outputType) {
      return function (key, message) {
        return new HmacMd5(key, true).update(message)[outputType]();
      };
    };

    /**
     * @method create
     * @memberof md5.hmac
     * @description Create HmacMd5 object
     * @param {String|Array|Uint8Array|ArrayBuffer} key key
     * @returns {HmacMd5} HmacMd5 object.
     * @example
     * var hash = md5.hmac.create('key');
     */
    /**
     * @method update
     * @memberof md5.hmac
     * @description Create and update HmacMd5 object
     * @param {String|Array|Uint8Array|ArrayBuffer} key key
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {HmacMd5} HmacMd5 object.
     * @example
     * var hash = md5.hmac.update('key', 'The quick brown fox jumps over the lazy dog');
     * // equal to
     * var hash = md5.hmac.create('key');
     * hash.update('The quick brown fox jumps over the lazy dog');
     */
    var createHmacMethod = function () {
      var method = createHmacOutputMethod('hex');
      method.create = function (key) {
        return new HmacMd5(key);
      };
      method.update = function (key, message) {
        return method.create(key).update(message);
      };
      for (var i = 0; i < OUTPUT_TYPES.length; ++i) {
        var type = OUTPUT_TYPES[i];
        method[type] = createHmacOutputMethod(type);
      }
      return method;
    };

    /**
     * Md5 class
     * @class Md5
     * @description This is internal class.
     * @see {@link md5.create}
     */
    function Md5(sharedMemory) {
      if (sharedMemory) {
        blocks[0] = blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        this.blocks = blocks;
        this.buffer8 = buffer8;
      } else {
        if (ARRAY_BUFFER) {
          var buffer = new ArrayBuffer(68);
          this.buffer8 = new Uint8Array(buffer);
          this.blocks = new Uint32Array(buffer);
        } else {
          this.blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
        }
      }
      this.h0 = this.h1 = this.h2 = this.h3 = this.start = this.bytes = this.hBytes = 0;
      this.finalized = this.hashed = false;
      this.first = true;
    }

    /**
     * @method update
     * @memberof Md5
     * @instance
     * @description Update hash
     * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
     * @returns {Md5} Md5 object.
     * @see {@link md5.update}
     */
    Md5.prototype.update = function (message) {
      if (this.finalized) {
        throw new Error(FINALIZE_ERROR);
      }
      var result = formatMessage(message);
      message = result[0];
      var isString = result[1];
      var code,
        index = 0,
        i,
        length = message.length,
        blocks = this.blocks;
      var buffer8 = this.buffer8;
      while (index < length) {
        if (this.hashed) {
          this.hashed = false;
          blocks[0] = blocks[16];
          blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
        }
        if (isString) {
          if (ARRAY_BUFFER) {
            for (i = this.start; index < length && i < 64; ++index) {
              code = message.charCodeAt(index);
              if (code < 0x80) {
                buffer8[i++] = code;
              } else if (code < 0x800) {
                buffer8[i++] = 0xc0 | code >>> 6;
                buffer8[i++] = 0x80 | code & 0x3f;
              } else if (code < 0xd800 || code >= 0xe000) {
                buffer8[i++] = 0xe0 | code >>> 12;
                buffer8[i++] = 0x80 | code >>> 6 & 0x3f;
                buffer8[i++] = 0x80 | code & 0x3f;
              } else {
                code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
                buffer8[i++] = 0xf0 | code >>> 18;
                buffer8[i++] = 0x80 | code >>> 12 & 0x3f;
                buffer8[i++] = 0x80 | code >>> 6 & 0x3f;
                buffer8[i++] = 0x80 | code & 0x3f;
              }
            }
          } else {
            for (i = this.start; index < length && i < 64; ++index) {
              code = message.charCodeAt(index);
              if (code < 0x80) {
                blocks[i >>> 2] |= code << SHIFT[i++ & 3];
              } else if (code < 0x800) {
                blocks[i >>> 2] |= (0xc0 | code >>> 6) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
              } else if (code < 0xd800 || code >= 0xe000) {
                blocks[i >>> 2] |= (0xe0 | code >>> 12) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (0x80 | code >>> 6 & 0x3f) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
              } else {
                code = 0x10000 + ((code & 0x3ff) << 10 | message.charCodeAt(++index) & 0x3ff);
                blocks[i >>> 2] |= (0xf0 | code >>> 18) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (0x80 | code >>> 12 & 0x3f) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (0x80 | code >>> 6 & 0x3f) << SHIFT[i++ & 3];
                blocks[i >>> 2] |= (0x80 | code & 0x3f) << SHIFT[i++ & 3];
              }
            }
          }
        } else {
          if (ARRAY_BUFFER) {
            for (i = this.start; index < length && i < 64; ++index) {
              buffer8[i++] = message[index];
            }
          } else {
            for (i = this.start; index < length && i < 64; ++index) {
              blocks[i >>> 2] |= message[index] << SHIFT[i++ & 3];
            }
          }
        }
        this.lastByteIndex = i;
        this.bytes += i - this.start;
        if (i >= 64) {
          this.start = i - 64;
          this.hash();
          this.hashed = true;
        } else {
          this.start = i;
        }
      }
      if (this.bytes > 4294967295) {
        this.hBytes += this.bytes / 4294967296 << 0;
        this.bytes = this.bytes % 4294967296;
      }
      return this;
    };
    Md5.prototype.finalize = function () {
      if (this.finalized) {
        return;
      }
      this.finalized = true;
      var blocks = this.blocks,
        i = this.lastByteIndex;
      blocks[i >>> 2] |= EXTRA[i & 3];
      if (i >= 56) {
        if (!this.hashed) {
          this.hash();
        }
        blocks[0] = blocks[16];
        blocks[16] = blocks[1] = blocks[2] = blocks[3] = blocks[4] = blocks[5] = blocks[6] = blocks[7] = blocks[8] = blocks[9] = blocks[10] = blocks[11] = blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0;
      }
      blocks[14] = this.bytes << 3;
      blocks[15] = this.hBytes << 3 | this.bytes >>> 29;
      this.hash();
    };
    Md5.prototype.hash = function () {
      var a,
        b,
        c,
        d,
        bc,
        da,
        blocks = this.blocks;
      if (this.first) {
        a = blocks[0] - 680876937;
        a = (a << 7 | a >>> 25) - 271733879 << 0;
        d = (-1732584194 ^ a & 2004318071) + blocks[1] - 117830708;
        d = (d << 12 | d >>> 20) + a << 0;
        c = (-271733879 ^ d & (a ^ -271733879)) + blocks[2] - 1126478375;
        c = (c << 17 | c >>> 15) + d << 0;
        b = (a ^ c & (d ^ a)) + blocks[3] - 1316259209;
        b = (b << 22 | b >>> 10) + c << 0;
      } else {
        a = this.h0;
        b = this.h1;
        c = this.h2;
        d = this.h3;
        a += (d ^ b & (c ^ d)) + blocks[0] - 680876936;
        a = (a << 7 | a >>> 25) + b << 0;
        d += (c ^ a & (b ^ c)) + blocks[1] - 389564586;
        d = (d << 12 | d >>> 20) + a << 0;
        c += (b ^ d & (a ^ b)) + blocks[2] + 606105819;
        c = (c << 17 | c >>> 15) + d << 0;
        b += (a ^ c & (d ^ a)) + blocks[3] - 1044525330;
        b = (b << 22 | b >>> 10) + c << 0;
      }
      a += (d ^ b & (c ^ d)) + blocks[4] - 176418897;
      a = (a << 7 | a >>> 25) + b << 0;
      d += (c ^ a & (b ^ c)) + blocks[5] + 1200080426;
      d = (d << 12 | d >>> 20) + a << 0;
      c += (b ^ d & (a ^ b)) + blocks[6] - 1473231341;
      c = (c << 17 | c >>> 15) + d << 0;
      b += (a ^ c & (d ^ a)) + blocks[7] - 45705983;
      b = (b << 22 | b >>> 10) + c << 0;
      a += (d ^ b & (c ^ d)) + blocks[8] + 1770035416;
      a = (a << 7 | a >>> 25) + b << 0;
      d += (c ^ a & (b ^ c)) + blocks[9] - 1958414417;
      d = (d << 12 | d >>> 20) + a << 0;
      c += (b ^ d & (a ^ b)) + blocks[10] - 42063;
      c = (c << 17 | c >>> 15) + d << 0;
      b += (a ^ c & (d ^ a)) + blocks[11] - 1990404162;
      b = (b << 22 | b >>> 10) + c << 0;
      a += (d ^ b & (c ^ d)) + blocks[12] + 1804603682;
      a = (a << 7 | a >>> 25) + b << 0;
      d += (c ^ a & (b ^ c)) + blocks[13] - 40341101;
      d = (d << 12 | d >>> 20) + a << 0;
      c += (b ^ d & (a ^ b)) + blocks[14] - 1502002290;
      c = (c << 17 | c >>> 15) + d << 0;
      b += (a ^ c & (d ^ a)) + blocks[15] + 1236535329;
      b = (b << 22 | b >>> 10) + c << 0;
      a += (c ^ d & (b ^ c)) + blocks[1] - 165796510;
      a = (a << 5 | a >>> 27) + b << 0;
      d += (b ^ c & (a ^ b)) + blocks[6] - 1069501632;
      d = (d << 9 | d >>> 23) + a << 0;
      c += (a ^ b & (d ^ a)) + blocks[11] + 643717713;
      c = (c << 14 | c >>> 18) + d << 0;
      b += (d ^ a & (c ^ d)) + blocks[0] - 373897302;
      b = (b << 20 | b >>> 12) + c << 0;
      a += (c ^ d & (b ^ c)) + blocks[5] - 701558691;
      a = (a << 5 | a >>> 27) + b << 0;
      d += (b ^ c & (a ^ b)) + blocks[10] + 38016083;
      d = (d << 9 | d >>> 23) + a << 0;
      c += (a ^ b & (d ^ a)) + blocks[15] - 660478335;
      c = (c << 14 | c >>> 18) + d << 0;
      b += (d ^ a & (c ^ d)) + blocks[4] - 405537848;
      b = (b << 20 | b >>> 12) + c << 0;
      a += (c ^ d & (b ^ c)) + blocks[9] + 568446438;
      a = (a << 5 | a >>> 27) + b << 0;
      d += (b ^ c & (a ^ b)) + blocks[14] - 1019803690;
      d = (d << 9 | d >>> 23) + a << 0;
      c += (a ^ b & (d ^ a)) + blocks[3] - 187363961;
      c = (c << 14 | c >>> 18) + d << 0;
      b += (d ^ a & (c ^ d)) + blocks[8] + 1163531501;
      b = (b << 20 | b >>> 12) + c << 0;
      a += (c ^ d & (b ^ c)) + blocks[13] - 1444681467;
      a = (a << 5 | a >>> 27) + b << 0;
      d += (b ^ c & (a ^ b)) + blocks[2] - 51403784;
      d = (d << 9 | d >>> 23) + a << 0;
      c += (a ^ b & (d ^ a)) + blocks[7] + 1735328473;
      c = (c << 14 | c >>> 18) + d << 0;
      b += (d ^ a & (c ^ d)) + blocks[12] - 1926607734;
      b = (b << 20 | b >>> 12) + c << 0;
      bc = b ^ c;
      a += (bc ^ d) + blocks[5] - 378558;
      a = (a << 4 | a >>> 28) + b << 0;
      d += (bc ^ a) + blocks[8] - 2022574463;
      d = (d << 11 | d >>> 21) + a << 0;
      da = d ^ a;
      c += (da ^ b) + blocks[11] + 1839030562;
      c = (c << 16 | c >>> 16) + d << 0;
      b += (da ^ c) + blocks[14] - 35309556;
      b = (b << 23 | b >>> 9) + c << 0;
      bc = b ^ c;
      a += (bc ^ d) + blocks[1] - 1530992060;
      a = (a << 4 | a >>> 28) + b << 0;
      d += (bc ^ a) + blocks[4] + 1272893353;
      d = (d << 11 | d >>> 21) + a << 0;
      da = d ^ a;
      c += (da ^ b) + blocks[7] - 155497632;
      c = (c << 16 | c >>> 16) + d << 0;
      b += (da ^ c) + blocks[10] - 1094730640;
      b = (b << 23 | b >>> 9) + c << 0;
      bc = b ^ c;
      a += (bc ^ d) + blocks[13] + 681279174;
      a = (a << 4 | a >>> 28) + b << 0;
      d += (bc ^ a) + blocks[0] - 358537222;
      d = (d << 11 | d >>> 21) + a << 0;
      da = d ^ a;
      c += (da ^ b) + blocks[3] - 722521979;
      c = (c << 16 | c >>> 16) + d << 0;
      b += (da ^ c) + blocks[6] + 76029189;
      b = (b << 23 | b >>> 9) + c << 0;
      bc = b ^ c;
      a += (bc ^ d) + blocks[9] - 640364487;
      a = (a << 4 | a >>> 28) + b << 0;
      d += (bc ^ a) + blocks[12] - 421815835;
      d = (d << 11 | d >>> 21) + a << 0;
      da = d ^ a;
      c += (da ^ b) + blocks[15] + 530742520;
      c = (c << 16 | c >>> 16) + d << 0;
      b += (da ^ c) + blocks[2] - 995338651;
      b = (b << 23 | b >>> 9) + c << 0;
      a += (c ^ (b | ~d)) + blocks[0] - 198630844;
      a = (a << 6 | a >>> 26) + b << 0;
      d += (b ^ (a | ~c)) + blocks[7] + 1126891415;
      d = (d << 10 | d >>> 22) + a << 0;
      c += (a ^ (d | ~b)) + blocks[14] - 1416354905;
      c = (c << 15 | c >>> 17) + d << 0;
      b += (d ^ (c | ~a)) + blocks[5] - 57434055;
      b = (b << 21 | b >>> 11) + c << 0;
      a += (c ^ (b | ~d)) + blocks[12] + 1700485571;
      a = (a << 6 | a >>> 26) + b << 0;
      d += (b ^ (a | ~c)) + blocks[3] - 1894986606;
      d = (d << 10 | d >>> 22) + a << 0;
      c += (a ^ (d | ~b)) + blocks[10] - 1051523;
      c = (c << 15 | c >>> 17) + d << 0;
      b += (d ^ (c | ~a)) + blocks[1] - 2054922799;
      b = (b << 21 | b >>> 11) + c << 0;
      a += (c ^ (b | ~d)) + blocks[8] + 1873313359;
      a = (a << 6 | a >>> 26) + b << 0;
      d += (b ^ (a | ~c)) + blocks[15] - 30611744;
      d = (d << 10 | d >>> 22) + a << 0;
      c += (a ^ (d | ~b)) + blocks[6] - 1560198380;
      c = (c << 15 | c >>> 17) + d << 0;
      b += (d ^ (c | ~a)) + blocks[13] + 1309151649;
      b = (b << 21 | b >>> 11) + c << 0;
      a += (c ^ (b | ~d)) + blocks[4] - 145523070;
      a = (a << 6 | a >>> 26) + b << 0;
      d += (b ^ (a | ~c)) + blocks[11] - 1120210379;
      d = (d << 10 | d >>> 22) + a << 0;
      c += (a ^ (d | ~b)) + blocks[2] + 718787259;
      c = (c << 15 | c >>> 17) + d << 0;
      b += (d ^ (c | ~a)) + blocks[9] - 343485551;
      b = (b << 21 | b >>> 11) + c << 0;
      if (this.first) {
        this.h0 = a + 1732584193 << 0;
        this.h1 = b - 271733879 << 0;
        this.h2 = c - 1732584194 << 0;
        this.h3 = d + 271733878 << 0;
        this.first = false;
      } else {
        this.h0 = this.h0 + a << 0;
        this.h1 = this.h1 + b << 0;
        this.h2 = this.h2 + c << 0;
        this.h3 = this.h3 + d << 0;
      }
    };

    /**
     * @method hex
     * @memberof Md5
     * @instance
     * @description Output hash as hex string
     * @returns {String} Hex string
     * @see {@link md5.hex}
     * @example
     * hash.hex();
     */
    Md5.prototype.hex = function () {
      this.finalize();
      var h0 = this.h0,
        h1 = this.h1,
        h2 = this.h2,
        h3 = this.h3;
      return HEX_CHARS[h0 >>> 4 & 0x0F] + HEX_CHARS[h0 & 0x0F] + HEX_CHARS[h0 >>> 12 & 0x0F] + HEX_CHARS[h0 >>> 8 & 0x0F] + HEX_CHARS[h0 >>> 20 & 0x0F] + HEX_CHARS[h0 >>> 16 & 0x0F] + HEX_CHARS[h0 >>> 28 & 0x0F] + HEX_CHARS[h0 >>> 24 & 0x0F] + HEX_CHARS[h1 >>> 4 & 0x0F] + HEX_CHARS[h1 & 0x0F] + HEX_CHARS[h1 >>> 12 & 0x0F] + HEX_CHARS[h1 >>> 8 & 0x0F] + HEX_CHARS[h1 >>> 20 & 0x0F] + HEX_CHARS[h1 >>> 16 & 0x0F] + HEX_CHARS[h1 >>> 28 & 0x0F] + HEX_CHARS[h1 >>> 24 & 0x0F] + HEX_CHARS[h2 >>> 4 & 0x0F] + HEX_CHARS[h2 & 0x0F] + HEX_CHARS[h2 >>> 12 & 0x0F] + HEX_CHARS[h2 >>> 8 & 0x0F] + HEX_CHARS[h2 >>> 20 & 0x0F] + HEX_CHARS[h2 >>> 16 & 0x0F] + HEX_CHARS[h2 >>> 28 & 0x0F] + HEX_CHARS[h2 >>> 24 & 0x0F] + HEX_CHARS[h3 >>> 4 & 0x0F] + HEX_CHARS[h3 & 0x0F] + HEX_CHARS[h3 >>> 12 & 0x0F] + HEX_CHARS[h3 >>> 8 & 0x0F] + HEX_CHARS[h3 >>> 20 & 0x0F] + HEX_CHARS[h3 >>> 16 & 0x0F] + HEX_CHARS[h3 >>> 28 & 0x0F] + HEX_CHARS[h3 >>> 24 & 0x0F];
    };

    /**
     * @method toString
     * @memberof Md5
     * @instance
     * @description Output hash as hex string
     * @returns {String} Hex string
     * @see {@link md5.hex}
     * @example
     * hash.toString();
     */
    Md5.prototype.toString = Md5.prototype.hex;

    /**
     * @method digest
     * @memberof Md5
     * @instance
     * @description Output hash as bytes array
     * @returns {Array} Bytes array
     * @see {@link md5.digest}
     * @example
     * hash.digest();
     */
    Md5.prototype.digest = function () {
      this.finalize();
      var h0 = this.h0,
        h1 = this.h1,
        h2 = this.h2,
        h3 = this.h3;
      return [h0 & 0xFF, h0 >>> 8 & 0xFF, h0 >>> 16 & 0xFF, h0 >>> 24 & 0xFF, h1 & 0xFF, h1 >>> 8 & 0xFF, h1 >>> 16 & 0xFF, h1 >>> 24 & 0xFF, h2 & 0xFF, h2 >>> 8 & 0xFF, h2 >>> 16 & 0xFF, h2 >>> 24 & 0xFF, h3 & 0xFF, h3 >>> 8 & 0xFF, h3 >>> 16 & 0xFF, h3 >>> 24 & 0xFF];
    };

    /**
     * @method array
     * @memberof Md5
     * @instance
     * @description Output hash as bytes array
     * @returns {Array} Bytes array
     * @see {@link md5.array}
     * @example
     * hash.array();
     */
    Md5.prototype.array = Md5.prototype.digest;

    /**
     * @method arrayBuffer
     * @memberof Md5
     * @instance
     * @description Output hash as ArrayBuffer
     * @returns {ArrayBuffer} ArrayBuffer
     * @see {@link md5.arrayBuffer}
     * @example
     * hash.arrayBuffer();
     */
    Md5.prototype.arrayBuffer = function () {
      this.finalize();
      var buffer = new ArrayBuffer(16);
      var blocks = new Uint32Array(buffer);
      blocks[0] = this.h0;
      blocks[1] = this.h1;
      blocks[2] = this.h2;
      blocks[3] = this.h3;
      return buffer;
    };

    /**
     * @method buffer
     * @deprecated This maybe confuse with Buffer in node.js. Please use arrayBuffer instead.
     * @memberof Md5
     * @instance
     * @description Output hash as ArrayBuffer
     * @returns {ArrayBuffer} ArrayBuffer
     * @see {@link md5.buffer}
     * @example
     * hash.buffer();
     */
    Md5.prototype.buffer = Md5.prototype.arrayBuffer;

    /**
     * @method base64
     * @memberof Md5
     * @instance
     * @description Output hash as base64 string
     * @returns {String} base64 string
     * @see {@link md5.base64}
     * @example
     * hash.base64();
     */
    Md5.prototype.base64 = function () {
      var v1,
        v2,
        v3,
        base64Str = '',
        bytes = this.array();
      for (var i = 0; i < 15;) {
        v1 = bytes[i++];
        v2 = bytes[i++];
        v3 = bytes[i++];
        base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[(v1 << 4 | v2 >>> 4) & 63] + BASE64_ENCODE_CHAR[(v2 << 2 | v3 >>> 6) & 63] + BASE64_ENCODE_CHAR[v3 & 63];
      }
      v1 = bytes[i];
      base64Str += BASE64_ENCODE_CHAR[v1 >>> 2] + BASE64_ENCODE_CHAR[v1 << 4 & 63] + '==';
      return base64Str;
    };

    /**
     * HmacMd5 class
     * @class HmacMd5
     * @extends Md5
     * @description This is internal class.
     * @see {@link md5.hmac.create}
     */
    function HmacMd5(key, sharedMemory) {
      var i,
        result = formatMessage(key);
      key = result[0];
      if (result[1]) {
        var bytes = [],
          length = key.length,
          index = 0,
          code;
        for (i = 0; i < length; ++i) {
          code = key.charCodeAt(i);
          if (code < 0x80) {
            bytes[index++] = code;
          } else if (code < 0x800) {
            bytes[index++] = 0xc0 | code >>> 6;
            bytes[index++] = 0x80 | code & 0x3f;
          } else if (code < 0xd800 || code >= 0xe000) {
            bytes[index++] = 0xe0 | code >>> 12;
            bytes[index++] = 0x80 | code >>> 6 & 0x3f;
            bytes[index++] = 0x80 | code & 0x3f;
          } else {
            code = 0x10000 + ((code & 0x3ff) << 10 | key.charCodeAt(++i) & 0x3ff);
            bytes[index++] = 0xf0 | code >>> 18;
            bytes[index++] = 0x80 | code >>> 12 & 0x3f;
            bytes[index++] = 0x80 | code >>> 6 & 0x3f;
            bytes[index++] = 0x80 | code & 0x3f;
          }
        }
        key = bytes;
      }
      if (key.length > 64) {
        key = new Md5(true).update(key).array();
      }
      var oKeyPad = [],
        iKeyPad = [];
      for (i = 0; i < 64; ++i) {
        var b = key[i] || 0;
        oKeyPad[i] = 0x5c ^ b;
        iKeyPad[i] = 0x36 ^ b;
      }
      Md5.call(this, sharedMemory);
      this.update(iKeyPad);
      this.oKeyPad = oKeyPad;
      this.inner = true;
      this.sharedMemory = sharedMemory;
    }
    HmacMd5.prototype = new Md5();
    HmacMd5.prototype.finalize = function () {
      Md5.prototype.finalize.call(this);
      if (this.inner) {
        this.inner = false;
        var innerHash = this.array();
        Md5.call(this, this.sharedMemory);
        this.update(this.oKeyPad);
        this.update(innerHash);
        Md5.prototype.finalize.call(this);
      }
    };
    var exports = createMethod();
    exports.md5 = exports;
    exports.md5.hmac = createHmacMethod();
    if (COMMON_JS) {
      module.exports = exports;
    } else {
      /**
       * @method md5
       * @description Md5 hash function, export to global in browsers.
       * @param {String|Array|Uint8Array|ArrayBuffer} message message to hash
       * @returns {String} md5 hashes
       * @example
       * md5(''); // d41d8cd98f00b204e9800998ecf8427e
       * md5('The quick brown fox jumps over the lazy dog'); // 9e107d9d372bb6826bd81d3542a419d6
       * md5('The quick brown fox jumps over the lazy dog.'); // e4d909c290d0fb1ca068ffaddf22cbd0
       *
       * // It also supports UTF-8 encoding
       * md5('中文'); // a7bac2239fcdcb3a067903d8077c4a07
       *
       * // It also supports byte `Array`, `Uint8Array`, `ArrayBuffer`
       * md5([]); // d41d8cd98f00b204e9800998ecf8427e
       * md5(new Uint8Array([])); // d41d8cd98f00b204e9800998ecf8427e
       */
      root.md5 = exports;
    }
  })();
})(md5);
var md5Exports = md5.exports;

function _optionalChain$1(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }













class Class {
   __init() {this.studentList = [];}
   __init2() {this.codeStart = 0;}
   __init3() {this.classid = 0;}
  constructor(cid) {Class.prototype.__init.call(this);Class.prototype.__init2.call(this);Class.prototype.__init3.call(this);
    const year = Math.floor(cid / 100);
    const classid = cid % 100;
    const yearInCode = year % 100;
    this.classid = cid;
    const specialCodeMap = {
      9: {
        schoolId: 39,
        classId: 1,
      },
      10: {
        schoolId: 39,
        classId: 2,
      },
      11: {
        schoolId: 9,
        classId: 9,
      },
      12: {
        schoolId: 9,
        classId: 10,
      },
    } ;
    if (
      Object.entries(specialCodeMap)
        .map((x) => x[0].toString())
        .includes(classid.toString())
    ) {
      const res = specialCodeMap[classid];
      this.codeStart = res.schoolId * 10000 + yearInCode * 100 + res.classId;
    } else {
      const id = classid % 100;
      if (id < 10) {
        this.codeStart = 90000 + yearInCode * 100 + classid;
      } else {
        this.codeStart = 390000 + yearInCode * 100 + (classid % 10);
      }
    }
  }
   appendUser(user) {
    this.studentList.push(user);
    console.log(
      "Stored user with id",
      user.id,
      "in _id",
      user._id,
      "into class",
      this.classid
    );
  }
   removeUser(_id) {
    this.studentList = this.studentList.filter((x) => x._id !== _id);
  }
   getUserCode(_id) {
    const idx = this.studentList.findIndex((x) => x._id === _id);
    return this.codeStart * 100 + idx + 1;
  }
   getUser(_id) {
    return this.studentList.find((x) => x._id === _id);
  }
}

class ZhenhaiHighSchool {
   __init4() {this.classList = [];}
  constructor() {ZhenhaiHighSchool.prototype.__init4.call(this);
    for (let y = 2022; y <= 2023; y++) {
      for (let i = 1; i <= 17; i++) {
        this.classList.push(new Class(y * 100 + i));
      }
    }
  }
   appendUser(user) {
    console.log(
      "Append user",
      user.id,
      "into class",
      Math.floor(user.id / 100)
    );
    const idx = this.classList.findIndex(
      (x) => x.classid === Math.floor(user.id / 100)
    );
    if (idx !== -1) this.classList[idx].appendUser(user);
  }
   removeUser(_id, classid) {
    const cls = this.classList.find((x) => x.classid === classid);
    _optionalChain$1([cls, 'optionalAccess', _ => _.removeUser, 'call', _2 => _2(_id)]);
  }
   getUserCode(_id, classid) {
    const idx = this.classList.findIndex((x) => x.classid === classid);
    if (idx !== -1) return this.classList[idx].getUserCode(_id);
  }
   studentExchange(change) {
    const oldClassId = Math.floor(change.previous / 100);
    const newClassId = change.toClass;
    const oldClass = this.classList.find((x) => x.classid === oldClassId);
    const newClass = this.classList.find((x) => x.classid === newClassId);
    if (oldClass && newClass) {
      const old = oldClass.getUser(change._id);
      if (old) {
        oldClass.removeUser(change._id);
        newClass.appendUser(old);
        console.log(
          "Student",
          change._id,
          "exchanged from",
          oldClassId,
          "to",
          newClassId,
          "with new code",
          this.getUserCode(change._id, newClassId)
        );
      }
    }
  }
   getClassStudentList(year, classid) {
    const cls = this.classList.find((x) => x.classid === year * 100 + classid);
    return _optionalChain$1([cls, 'optionalAccess', _3 => _3.studentList]);
  }
   getClassWithCode(code) {
    const cls = this.classList.find(
      (x) => x.codeStart === Math.floor(code / 100)
    );
    return _optionalChain$1([cls, 'optionalAccess', _4 => _4.classid]);
  }
}

function _nullishCoalesce$1(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }

const zhzx = new ZhenhaiHighSchool();

function getUserPosition(permission) {
  /**
   * 1. Student - 0
   * 2. Secretary - 1
   * 3. Auditor - 2
   * 4. Department - 4
   * 4. Inspector - 8
   * 5. Admin - 16
   * 6. System - 32
   * Stackable, Unique
   */
  const isStudent = true;
  const isSecretary = permission & 1;
  const isDepartment = permission & 2;
  const isAuditor = permission & 4;
  const isInspector = permission & 8;
  const isAdmin = permission & 16;
  const isSystem = permission & 32;
  const result = (
    [
      "student",
      "secretary",
      "department",
      "auditor",
      "inspector",
      "admin",
      "system",
    ] 
  ).filter(
    (_, i) =>
      [
        isStudent,
        isSecretary,
        isDepartment,
        isAuditor,
        isInspector,
        isAdmin,
        isSystem,
      ][i]
  );
  return result;
}

function UserTransform(user) {
  const result = {
    _id: new mongodb.ObjectId(),
    id: user.userid,
    name: user.username,
    sex: "unknown" ,
    position: getUserPosition(user.permission),
    code: user.classid * 100 + (user.userid % 100),
  };
  if (user.userid > 20219999) {
    zhzx.appendUser({
      id: result.id,
      _id: result._id.toString(),
      name: result.name,
    });
    const code = zhzx.getUserCode(
      result._id.toString(),
      Math.floor(result.id / 100)
    );
    if (code) {
      result.code = code;
    }
  }
  console.log("Transformed user", user.userid, "with code", result.code);
  return result;
}

function withPassword(user) {
  return {
    ...user,
    password: md5Exports.md5(user.id.toString()),
  };
}

function transformUser(users) {
  return users
    .map((user) => {
      return UserTransform(user);
    })
    .map((user) => {
      return withPassword(user);
    });
}

function transformUserToJSON() {
  const users = fs.readFileSync(path.resolve("data", "export", "user.json"), "utf-8");
  const parsed = JSON.parse(users);
  const transformed = transformUser(parsed);
  fs.writeFileSync(
    path.resolve("data", "handler", "user-transformed.json"),
    JSON.stringify(transformed, null, 2)
  );
  const interclassMap = getUserWhoseNumberIsNotStartsWithClassId(parsed);
  const class2Grade2023 = resortNumberListInClass2Grade2023();
  const maps = [interclassMap, class2Grade2023].flat(1);
  fs.writeFileSync(
    path.resolve("data", "handler", "mappings.json"),
    JSON.stringify(
      maps.filter((x) => _optionalChain([x, 'optionalAccess', _2 => _2.code]) && x),
      null,
      2
    )
  );
  fs.writeFileSync(
    path.resolve("data", "handler", "classid-changed.json"),
    JSON.stringify(getUserWhoseNumberIsNotStartsWithClassId(parsed), null, 2)
  );
  fs.writeFileSync(
    path.resolve("data", "handler", "class2-2023.json"),
    JSON.stringify(resortNumberListInClass2Grade2023(), null, 2)
  );
}

const userMap = [];

function findUser(user) {
  if (userMap.length === 0) {
    const list = fs.readFileSync(
      path.resolve("data", "handler", "user-transformed.json"),
      "utf-8"
    );
    userMap.push(...(JSON.parse(list) ));
  }
  const result = _optionalChain([userMap, 'access', _3 => _3.find, 'call', _4 => _4((u) => u.id === user), 'optionalAccess', _5 => _5._id]) 

;
  if (result) {
    console.log("Found user", user, "with id", result);
    return new mongodb.ObjectId(result);
  } else {
    throw new Error("User not found");
  }
}

function getUserWhoseNumberIsNotStartsWithClassId(users) {
  return users
    .filter((user) => {
      return !user.userid.toString().startsWith(user.classid.toString());
    })
    .map((x) => {
      zhzx.studentExchange({
        _id: findUser(x.userid).toString(),
        toClass: x.classid,
        previous: x.userid,
      });
      // Grade 2022, their `id` is not changed, but in Grade 2023, their `id` is changed.
      const result = {
        _id: findUser(x.userid),
        id: x.userid,
        name: x.username,
        code: zhzx.getUserCode(findUser(x.userid).toString(), x.classid),
      };
      if (x.userid > 20229999 && result.code) {
        const ending = result.code % 100;
        result.id = x.classid * 100 + ending;
      }
      return result;
    });
}

function resortNumberListInClass2Grade2023() {
  const studentList = _optionalChain([zhzx
, 'access', _6 => _6.getClassStudentList, 'call', _7 => _7(2023, 2)
, 'optionalAccess', _8 => _8.map, 'call', _9 => _9((x) => {
      const code = _nullishCoalesce$1(zhzx.getUserCode(x._id, 202302), () => ( 0));
      return {
        _id: x._id,
        id: 20230200 + (code % 100),
        name: x.name,
        code,
      };
    })
, 'access', _10 => _10.sort, 'call', _11 => _11((a, b) => a.code - b.code)]);
  return studentList;
}








function mappingUser(users, mappings) {
  return users.map((user) => {
    if (user.id > 20219999) {
      const map = mappings.find((x) => x._id === user._id.toString());
      if (map) {
        return {
          ...user,
          id: map.id,
          code: map.code,
          password: md5Exports.md5(map.id.toString()),
        };
      } else return user;
    } else return user;
  });
}

function transformUserToJSONWithMapping() {
  const users = fs.readFileSync(
    path.resolve("data", "handler", "user-transformed.json"),
    "utf-8"
  );
  const maps = fs.readFileSync(
    path.resolve("data", "handler", "mappings.json"),
    "utf-8"
  );
  const parsed = JSON.parse(users);
  const mapsParsed = JSON.parse(maps);
  const mapped = mappingUser(
    parsed ,
    mapsParsed 
  ).map((x) => {
    console.log(
      "Mapped user",
      x.id,
      "with code",
      x.code,
      "in class",
      zhzx.getClassWithCode(x.code),
      "with updated id:",
      zhzx.getUserCode(x._id.toString(), _nullishCoalesce$1(zhzx.getClassWithCode(x.code), () => ( 0)))
    );
    x.code =
      _nullishCoalesce$1(zhzx.getUserCode(x._id.toString(), _nullishCoalesce$1(zhzx.getClassWithCode(x.code), () => ( 0))), () => (
      x.code));
    x.name = x.name.replace(/[A-Za-z0-9]+/, "");
    return x;
  });
  fs.writeFileSync(
    path.resolve("data", "handler", "user-transformed-mapped.json"),
    JSON.stringify(mapped, null, 2)
  );
}

var V3VolunteerStatus; (function (V3VolunteerStatus) {
  const UNAUDITED = 1; V3VolunteerStatus[V3VolunteerStatus["UNAUDITED"] = UNAUDITED] = "UNAUDITED";
  const ACCEPTED = 2; V3VolunteerStatus[V3VolunteerStatus["ACCEPTED"] = ACCEPTED] = "ACCEPTED";
  const REJECTED = 3; V3VolunteerStatus[V3VolunteerStatus["REJECTED"] = REJECTED] = "REJECTED";
  const SPECIAL = 4; V3VolunteerStatus[V3VolunteerStatus["SPECIAL"] = SPECIAL] = "SPECIAL";
})(V3VolunteerStatus || (V3VolunteerStatus = {}));

var V3UserVolunteerStatus; (function (V3UserVolunteerStatus) {
  const WAITING_FOR_SIGNUP_AUDIT = 1; V3UserVolunteerStatus[V3UserVolunteerStatus["WAITING_FOR_SIGNUP_AUDIT"] = WAITING_FOR_SIGNUP_AUDIT] = "WAITING_FOR_SIGNUP_AUDIT";
  const DRAFT = 2; V3UserVolunteerStatus[V3UserVolunteerStatus["DRAFT"] = DRAFT] = "DRAFT";
  const WAITING_FOR_FIRST_AUDIT = 3; V3UserVolunteerStatus[V3UserVolunteerStatus["WAITING_FOR_FIRST_AUDIT"] = WAITING_FOR_FIRST_AUDIT] = "WAITING_FOR_FIRST_AUDIT";
  const WAITING_FOR_FINAL_AUDIT = 4; V3UserVolunteerStatus[V3UserVolunteerStatus["WAITING_FOR_FINAL_AUDIT"] = WAITING_FOR_FINAL_AUDIT] = "WAITING_FOR_FINAL_AUDIT";
  const ACCEPTED = 5; V3UserVolunteerStatus[V3UserVolunteerStatus["ACCEPTED"] = ACCEPTED] = "ACCEPTED";
  const REJECTED = 6; V3UserVolunteerStatus[V3UserVolunteerStatus["REJECTED"] = REJECTED] = "REJECTED";
  const SPIKE = 7; V3UserVolunteerStatus[V3UserVolunteerStatus["SPIKE"] = SPIKE] = "SPIKE";
})(V3UserVolunteerStatus || (V3UserVolunteerStatus = {}));

var V3VolunteerMode; (function (V3VolunteerMode) {
  const INSIDE = 1; V3VolunteerMode[V3VolunteerMode["INSIDE"] = INSIDE] = "INSIDE";
  const OUTSIDE = 2; V3VolunteerMode[V3VolunteerMode["OUTSIDE"] = OUTSIDE] = "OUTSIDE";
  const LARGE = 3; V3VolunteerMode[V3VolunteerMode["LARGE"] = LARGE] = "LARGE";
})(V3VolunteerMode || (V3VolunteerMode = {}));

var V3VolunteerType; (function (V3VolunteerType) {
  const INSIDE = 1; V3VolunteerType[V3VolunteerType["INSIDE"] = INSIDE] = "INSIDE";
  const APPOINTED = 2; V3VolunteerType[V3VolunteerType["APPOINTED"] = APPOINTED] = "APPOINTED";
  const SPECIAL = 3; V3VolunteerType[V3VolunteerType["SPECIAL"] = SPECIAL] = "SPECIAL";
})(V3VolunteerType || (V3VolunteerType = {}));

const v4ActivityStatus = ["", "pending", "effective", "refused", "effective"];

const v4ActivityType = ["", "specified", "social", "scale", "special"];

const v4ActivityClassify = ["", "on-campus", "off-campus", "social-practice"];

const v4ActivityMemberStatus = [
  "",
  "draft",
  "draft",
  "pending",
  "pending",
  "effective",
  "refused",
  "rejected",
];

function getStatus(status) {
  return v4ActivityStatus[status] ;
}

function getType(
  type,
  status,
  isCreatedBySystem = false
) {
  if (status === V3VolunteerStatus.SPECIAL || isCreatedBySystem) {
    return "special";
  }
  return v4ActivityType[type] ;
}

function getMode(mode) {
  return v4ActivityClassify[mode] ;
}

function getUserStatus(status) {
  return v4ActivityMemberStatus[status] ;
}

var dayjs_min = {exports: {}};

(function (module, exports) {
  !function (t, e) {
    module.exports = e() ;
  }(commonjsGlobal, function () {

    var t = 1e3,
      e = 6e4,
      n = 36e5,
      r = "millisecond",
      i = "second",
      s = "minute",
      u = "hour",
      a = "day",
      o = "week",
      c = "month",
      f = "quarter",
      h = "year",
      d = "date",
      l = "Invalid Date",
      $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,
      y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,
      M = {
        name: "en",
        weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),
        months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"),
        ordinal: function (t) {
          var e = ["th", "st", "nd", "rd"],
            n = t % 100;
          return "[" + t + (e[(n - 20) % 10] || e[n] || e[0]) + "]";
        }
      },
      m = function (t, e, n) {
        var r = String(t);
        return !r || r.length >= e ? t : "" + Array(e + 1 - r.length).join(n) + t;
      },
      v = {
        s: m,
        z: function (t) {
          var e = -t.utcOffset(),
            n = Math.abs(e),
            r = Math.floor(n / 60),
            i = n % 60;
          return (e <= 0 ? "+" : "-") + m(r, 2, "0") + ":" + m(i, 2, "0");
        },
        m: function t(e, n) {
          if (e.date() < n.date()) return -t(n, e);
          var r = 12 * (n.year() - e.year()) + (n.month() - e.month()),
            i = e.clone().add(r, c),
            s = n - i < 0,
            u = e.clone().add(r + (s ? -1 : 1), c);
          return +(-(r + (n - i) / (s ? i - u : u - i)) || 0);
        },
        a: function (t) {
          return t < 0 ? Math.ceil(t) || 0 : Math.floor(t);
        },
        p: function (t) {
          return {
            M: c,
            y: h,
            w: o,
            d: a,
            D: d,
            h: u,
            m: s,
            s: i,
            ms: r,
            Q: f
          }[t] || String(t || "").toLowerCase().replace(/s$/, "");
        },
        u: function (t) {
          return void 0 === t;
        }
      },
      g = "en",
      D = {};
    D[g] = M;
    var p = "$isDayjsObject",
      S = function (t) {
        return t instanceof _ || !(!t || !t[p]);
      },
      w = function t(e, n, r) {
        var i;
        if (!e) return g;
        if ("string" == typeof e) {
          var s = e.toLowerCase();
          D[s] && (i = s), n && (D[s] = n, i = s);
          var u = e.split("-");
          if (!i && u.length > 1) return t(u[0]);
        } else {
          var a = e.name;
          D[a] = e, i = a;
        }
        return !r && i && (g = i), i || !r && g;
      },
      O = function (t, e) {
        if (S(t)) return t.clone();
        var n = "object" == typeof e ? e : {};
        return n.date = t, n.args = arguments, new _(n);
      },
      b = v;
    b.l = w, b.i = S, b.w = function (t, e) {
      return O(t, {
        locale: e.$L,
        utc: e.$u,
        x: e.$x,
        $offset: e.$offset
      });
    };
    var _ = function () {
        function M(t) {
          this.$L = w(t.locale, null, !0), this.parse(t), this.$x = this.$x || t.x || {}, this[p] = !0;
        }
        var m = M.prototype;
        return m.parse = function (t) {
          this.$d = function (t) {
            var e = t.date,
              n = t.utc;
            if (null === e) return new Date(NaN);
            if (b.u(e)) return new Date();
            if (e instanceof Date) return new Date(e);
            if ("string" == typeof e && !/Z$/i.test(e)) {
              var r = e.match($);
              if (r) {
                var i = r[2] - 1 || 0,
                  s = (r[7] || "0").substring(0, 3);
                return n ? new Date(Date.UTC(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s)) : new Date(r[1], i, r[3] || 1, r[4] || 0, r[5] || 0, r[6] || 0, s);
              }
            }
            return new Date(e);
          }(t), this.init();
        }, m.init = function () {
          var t = this.$d;
          this.$y = t.getFullYear(), this.$M = t.getMonth(), this.$D = t.getDate(), this.$W = t.getDay(), this.$H = t.getHours(), this.$m = t.getMinutes(), this.$s = t.getSeconds(), this.$ms = t.getMilliseconds();
        }, m.$utils = function () {
          return b;
        }, m.isValid = function () {
          return !(this.$d.toString() === l);
        }, m.isSame = function (t, e) {
          var n = O(t);
          return this.startOf(e) <= n && n <= this.endOf(e);
        }, m.isAfter = function (t, e) {
          return O(t) < this.startOf(e);
        }, m.isBefore = function (t, e) {
          return this.endOf(e) < O(t);
        }, m.$g = function (t, e, n) {
          return b.u(t) ? this[e] : this.set(n, t);
        }, m.unix = function () {
          return Math.floor(this.valueOf() / 1e3);
        }, m.valueOf = function () {
          return this.$d.getTime();
        }, m.startOf = function (t, e) {
          var n = this,
            r = !!b.u(e) || e,
            f = b.p(t),
            l = function (t, e) {
              var i = b.w(n.$u ? Date.UTC(n.$y, e, t) : new Date(n.$y, e, t), n);
              return r ? i : i.endOf(a);
            },
            $ = function (t, e) {
              return b.w(n.toDate()[t].apply(n.toDate("s"), (r ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e)), n);
            },
            y = this.$W,
            M = this.$M,
            m = this.$D,
            v = "set" + (this.$u ? "UTC" : "");
          switch (f) {
            case h:
              return r ? l(1, 0) : l(31, 11);
            case c:
              return r ? l(1, M) : l(0, M + 1);
            case o:
              var g = this.$locale().weekStart || 0,
                D = (y < g ? y + 7 : y) - g;
              return l(r ? m - D : m + (6 - D), M);
            case a:
            case d:
              return $(v + "Hours", 0);
            case u:
              return $(v + "Minutes", 1);
            case s:
              return $(v + "Seconds", 2);
            case i:
              return $(v + "Milliseconds", 3);
            default:
              return this.clone();
          }
        }, m.endOf = function (t) {
          return this.startOf(t, !1);
        }, m.$set = function (t, e) {
          var n,
            o = b.p(t),
            f = "set" + (this.$u ? "UTC" : ""),
            l = (n = {}, n[a] = f + "Date", n[d] = f + "Date", n[c] = f + "Month", n[h] = f + "FullYear", n[u] = f + "Hours", n[s] = f + "Minutes", n[i] = f + "Seconds", n[r] = f + "Milliseconds", n)[o],
            $ = o === a ? this.$D + (e - this.$W) : e;
          if (o === c || o === h) {
            var y = this.clone().set(d, 1);
            y.$d[l]($), y.init(), this.$d = y.set(d, Math.min(this.$D, y.daysInMonth())).$d;
          } else l && this.$d[l]($);
          return this.init(), this;
        }, m.set = function (t, e) {
          return this.clone().$set(t, e);
        }, m.get = function (t) {
          return this[b.p(t)]();
        }, m.add = function (r, f) {
          var d,
            l = this;
          r = Number(r);
          var $ = b.p(f),
            y = function (t) {
              var e = O(l);
              return b.w(e.date(e.date() + Math.round(t * r)), l);
            };
          if ($ === c) return this.set(c, this.$M + r);
          if ($ === h) return this.set(h, this.$y + r);
          if ($ === a) return y(1);
          if ($ === o) return y(7);
          var M = (d = {}, d[s] = e, d[u] = n, d[i] = t, d)[$] || 1,
            m = this.$d.getTime() + r * M;
          return b.w(m, this);
        }, m.subtract = function (t, e) {
          return this.add(-1 * t, e);
        }, m.format = function (t) {
          var e = this,
            n = this.$locale();
          if (!this.isValid()) return n.invalidDate || l;
          var r = t || "YYYY-MM-DDTHH:mm:ssZ",
            i = b.z(this),
            s = this.$H,
            u = this.$m,
            a = this.$M,
            o = n.weekdays,
            c = n.months,
            f = n.meridiem,
            h = function (t, n, i, s) {
              return t && (t[n] || t(e, r)) || i[n].slice(0, s);
            },
            d = function (t) {
              return b.s(s % 12 || 12, t, "0");
            },
            $ = f || function (t, e, n) {
              var r = t < 12 ? "AM" : "PM";
              return n ? r.toLowerCase() : r;
            };
          return r.replace(y, function (t, r) {
            return r || function (t) {
              switch (t) {
                case "YY":
                  return String(e.$y).slice(-2);
                case "YYYY":
                  return b.s(e.$y, 4, "0");
                case "M":
                  return a + 1;
                case "MM":
                  return b.s(a + 1, 2, "0");
                case "MMM":
                  return h(n.monthsShort, a, c, 3);
                case "MMMM":
                  return h(c, a);
                case "D":
                  return e.$D;
                case "DD":
                  return b.s(e.$D, 2, "0");
                case "d":
                  return String(e.$W);
                case "dd":
                  return h(n.weekdaysMin, e.$W, o, 2);
                case "ddd":
                  return h(n.weekdaysShort, e.$W, o, 3);
                case "dddd":
                  return o[e.$W];
                case "H":
                  return String(s);
                case "HH":
                  return b.s(s, 2, "0");
                case "h":
                  return d(1);
                case "hh":
                  return d(2);
                case "a":
                  return $(s, u, !0);
                case "A":
                  return $(s, u, !1);
                case "m":
                  return String(u);
                case "mm":
                  return b.s(u, 2, "0");
                case "s":
                  return String(e.$s);
                case "ss":
                  return b.s(e.$s, 2, "0");
                case "SSS":
                  return b.s(e.$ms, 3, "0");
                case "Z":
                  return i;
              }
              return null;
            }(t) || i.replace(":", "");
          });
        }, m.utcOffset = function () {
          return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
        }, m.diff = function (r, d, l) {
          var $,
            y = this,
            M = b.p(d),
            m = O(r),
            v = (m.utcOffset() - this.utcOffset()) * e,
            g = this - m,
            D = function () {
              return b.m(y, m);
            };
          switch (M) {
            case h:
              $ = D() / 12;
              break;
            case c:
              $ = D();
              break;
            case f:
              $ = D() / 3;
              break;
            case o:
              $ = (g - v) / 6048e5;
              break;
            case a:
              $ = (g - v) / 864e5;
              break;
            case u:
              $ = g / n;
              break;
            case s:
              $ = g / e;
              break;
            case i:
              $ = g / t;
              break;
            default:
              $ = g;
          }
          return l ? $ : b.a($);
        }, m.daysInMonth = function () {
          return this.endOf(c).$D;
        }, m.$locale = function () {
          return D[this.$L];
        }, m.locale = function (t, e) {
          if (!t) return this.$L;
          var n = this.clone(),
            r = w(t, e, !0);
          return r && (n.$L = r), n;
        }, m.clone = function () {
          return b.w(this.$d, this);
        }, m.toDate = function () {
          return new Date(this.valueOf());
        }, m.toJSON = function () {
          return this.isValid() ? this.toISOString() : null;
        }, m.toISOString = function () {
          return this.$d.toISOString();
        }, m.toString = function () {
          return this.$d.toUTCString();
        }, M;
      }(),
      k = _.prototype;
    return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach(function (t) {
      k[t[1]] = function (e) {
        return this.$g(e, t[0], t[1]);
      };
    }), O.extend = function (t, e) {
      return t.$i || (t(e, _, O), t.$i = !0), O;
    }, O.locale = w, O.isDayjs = S, O.unix = function (t) {
      return O(1e3 * t);
    }, O.en = D[g], O.Ls = D, O.p = {}, O;
  });
})(dayjs_min);
var dayjs_minExports = dayjs_min.exports;
var dayjs = /*@__PURE__*/getDefaultExportFromCjs(dayjs_minExports);

function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
const activityOidMap = new Map();
const activityList = [];

function init() {
  if (activityList.length === 0) {
    const activities = fs.readFileSync(
      path.resolve("data", "export", "volunteer.json"),
      "utf-8",
    );
    const parsed = JSON.parse(activities) ;
    activityList.push(...parsed);
  }
}

function getActivityOid(activity) {
  if (activity.description.startsWith("append to #")) {
    const lines = activity.description
      .replaceAll("\\n", "\n")
      .split("\n")
      .map((x) => x.trim());
    const oid = parseInt(lines[0].split("#")[1]);
    if (isNaN(oid)) return activity.id;
    function isInActivityList(oid) {
      return activityList.findIndex((x) => x.id === oid) !== -1;
    }
    if (!isInActivityList(oid)) return activity.id;
    if (activityOidMap.has(oid)) return activityOidMap.get(oid);
    activityOidMap.set(activity.id, oid);
    return oid;
  } else return activity.id;
}

function checkActivityOid(oid) {
  console.log("Checking activity oid", oid);
  if (activityOidMap.has(oid)) return activityOidMap.get(oid);
  else return oid;
}

function transformLinearStructure(activities) {
  return activities.map((activity) => {
    console.log(
      "Transforming activity",
      activity.id,
      "with status",
      activity.status,
    );
    const status = getStatus(activity.status) ;
    const type =
      activity.holder === 0
        ? "special"
        : getType(activity.type, activity.status);
    const result = {
      _id: new mongodb.ObjectId(),
      type,
      name: activity.name
        .replaceAll("（其他）", "")
        .replaceAll("（社团）", "")
        .replaceAll("（获奖）", "")
        .trim(),
      description: activity.description.replaceAll("自提交义工：", "").trim(),
      members: [],
      duration: activity.reward / 60,
      date: dayjs(activity.time).toISOString(),
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString(),
      creator: findUser(activity.holder).toString(),
      status,
      oid: getActivityOid(activity),
    } 

;
    const special = {
      classify:
        activity.holder === 0
          ? "import"
          : activity.name.endsWith("（其他）")
          ? "other"
          : activity.name.endsWith("（社团）")
          ? "club"
          : "other",
      mode: getMode(activity.type ),
    } ;
    const registration = {
      place: "可莉不知道哦",
      deadline: dayjs(activity.time).toISOString(),
      classes: [],
    } ;
    if (result.type === "specified") {
      console.log("It is a specified activity.");
      return {
        ...result,
        registration: registration,
      } 

;
    }
    if (result.type === "special") {
      console.log("It is a special activity.");
      return {
        ...result,
        special,
      } 

;
    }
    return result;
  });
}

function transformActivityMember(
  member,
  mode,
  duration,
  images = [],
) {
  const status = getUserStatus(member.status);
  console.log("Transforming member", member.userid, "with status", status);
  return {
    _id: findUser(member.userid).toString(),
    status,
    mode,
    impression: member.thought,
    duration: _nullishCoalesce(member.reward / 60, () => ( duration)),
    history: [],
    images,
  } ;
}

function getActivityMode(oid) {
  const idx = activityList.findIndex((x) => x.id === oid);
  if (idx === -1) return "on-campus";
  else return getMode(activityList[idx].type );
}

function appendMemberIntoActivity(
  activities,
  members,
  images = [],
  classes = [],
) {
  members.map((member) => {
    const volid = checkActivityOid(member.volid);
    const idx = activities.findIndex((x) => x.oid === volid);
    if (idx) {
      console.log("Appending member", member.userid, "into activity", idx);
      const activity = activities[idx] ;
      const image = images
        .filter((x) => x.volid === member.volid && x.userid === member.userid)
        .map((x) => x.filename);
      const mode = getActivityMode(member.volid);
      console.log("Appending member", member.userid, "with mode", mode);
      if (activity.type === "special")
        activity.members.push(
          transformActivityMember(
            member,
            mode,
            activity.duration,
            image,
          ) ,
        );
      else if (
        activity.members.findIndex(
          (x) => x._id === findUser(member.userid).toString(),
        ) === -1
      )
        activity.members.push(
          transformActivityMember(
            member,
            mode,
            activity.duration,
            image,
          ) ,
        );
      else {
        console.log("Member", member.userid, "already exists in activity", idx);
        const record = activity.members.find(
          (x) => x._id === findUser(member.userid).toString(),
        );
        if (record) {
          record.images = record.images.concat(image);
          record.duration += member.reward / 60;
          /**
           * Merge Status and Impression.
           * If the status is "effective", then the impression will be appended.
           * If the status is "refused", then the impression will be replaced.
           * If the status is "rejected", then the impression will be replaced.
           * effective > rejected > pending > refused > draft
           */
          if (record.status === "effective") {
            record.impression += "\n" + member.thought;
          } else if (
            record.status === "refused" ||
            record.status === "rejected"
          ) {
            record.impression = member.thought;
            record.status =
              getUserStatus(member.status) === "effective"
                ? "effective"
                : record.status;
          }
        }
      }
    }
  });
  return activities
    .map((activity) => {
      const cls = classes.filter((x) => x.volid === activity.oid);
      if (cls.length === 0)
        console.log("No classes found for activity", activity.oid);
      else
        console.log(
          "Appending classes",
          cls.map((x) => x.classid).join(", "),
          "into activity",
          activity.oid,
        );
      if (cls.length !== 0 && activity.type === "specified") {
        return {
          ...activity,
          registration: {
            ...activity.registration,
            classes: cls.map((x) => ({
              class: x.classid,
              min: 0,
              max: x.max,
            })),
          },
        };
      } else return activity;
    })
    .filter(
      (x) =>
        x.members.length !== 0 &&
        !x.description.includes(".ignore") &&
        !x.description.includes("测试") &&
        !x.name.includes("测试"),
    )
    .map((x) => {
      delete x.oid;
      return x;
    });
}

function transformActivityToJSON() {
  init();
  const activities = fs.readFileSync(
    path.resolve("data", "export", "volunteer.json"),
    "utf-8",
  );
  const parsed = JSON.parse(activities);
  const members = fs.readFileSync(
    path.resolve("data", "export", "user_vol.json"),
    "utf-8",
  );
  const user_parsed = JSON.parse(members) ;
  const images = fs.readFileSync(
    path.resolve("data", "export", "picture.json"),
    "utf-8",
  );
  const image_parsed = JSON.parse(images) ;
  const classes = fs.readFileSync(
    path.resolve("data", "export", "class_vol.json"),
    "utf-8",
  );
  const class_parsed = JSON.parse(classes) ;
  const transformed = transformLinearStructure(parsed);
  const appended = appendMemberIntoActivity(
    transformed,
    user_parsed,
    image_parsed,
    class_parsed,
  );
  fs.writeFileSync(
    path.resolve("data", "handler", "activity-transformed.json"),
    JSON.stringify(appended, null, 2),
  );
}

async function userTransformToImportableData() {
  const file = await promises.readFile(
    path.resolve("data", "handler", "user-transformed-mapped.json"),
    "utf-8"
  );
  const parsed = JSON.parse(file);
  const mapped = parsed.map(async (x) => {
    const password = await bcrypt.hash(x.password, 10);
    console.log("Hashed password", x.id, "to", password, "for user", x.id);
    return {
      ...x,
      password,
      _id: {
        $oid: x._id,
      },
    };
  });
  const promised = await Promise.all(mapped);
  await promises.writeFile(
    path.resolve("data", "import", "users.json"),
    JSON.stringify(promised, null, "\t")
  );
  console.log("Exported the users in", path.resolve("data", "import", "users.json"));
}

async function activityTransformToImportableData() {
  const file = await promises.readFile(
    path.resolve("data", "handler", "activity-transformed.json"),
    "utf-8"
  );
  const parsed = JSON.parse(file);
  const mapped = parsed.map((x) => {
    return {
      ...x,
      _id: {
        $oid: x._id,
      },
    };
  });
  await promises.writeFile(
    path.resolve("data", "import", "activities.json"),
    JSON.stringify(mapped, null, "\t")
  );
  console.log(
    "Exported the activities in",
    path.resolve("data", "import", "activities.json")
  );
  console.log(
    "Now you can import the data into MongoDB using `mongoimport` with the following command:"
  );
  console.log(
    "mongoimport --db <database> --collection <collection> --file <file> --jsonArray"
  );
  console.log("Example:");
  console.log(
    "mongoimport --db test --collection users --file users.json --jsonArray"
  );
}

async function main() {
  console.time("export");
  // await copyZVMSSqliteDatabase();
  await exportToJSON();
  transformUserToJSON();
  transformActivityToJSON();
  transformUserToJSONWithMapping();
  await userTransformToImportableData();
  await activityTransformToImportableData();
  console.timeEnd("export");
}

main();
