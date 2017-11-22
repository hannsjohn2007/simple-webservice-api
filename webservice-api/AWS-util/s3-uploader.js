
const uuidV1 = require('../util/fileameGenerator').byUuidV1;
const Promise = require('bluebird');
let S3 = require('aws-sdk/clients/s3');
let s3= new S3();

module.exports = async (bucketName,part) => {
  return new Promise((resolve, reject) => {
    let param = {
      Bucket: bucketName,
      Key: uuidV1(part.filename.split('.').pop()),
      Body: part,
      ContentLength: part.byteCount};
    let options = {partSize: 10 * 1024 * 1024, queueSize: 1};
    s3.upload(param, options, (err, data)=> {
      if (err) reject(err);
      else{
        resolve(data)}
    });
  });
};