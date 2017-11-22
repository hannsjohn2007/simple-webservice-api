
let S3 = require('aws-sdk/clients/s3');
let s3= new S3();

module.exports = (bucketName, key) => {
  return s3.getObject({Bucket: bucketName, Key:key}).createReadStream();
};