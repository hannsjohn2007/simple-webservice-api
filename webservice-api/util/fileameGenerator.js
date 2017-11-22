"use strict";
const uuidV1 = require('uuid/v1');

module.exports.byUuidV1 = (ext) => {
  return `${uuidV1()}.${ext}`
};