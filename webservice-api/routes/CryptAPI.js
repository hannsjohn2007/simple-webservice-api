'use strict';
const Promise = require('bluebird');
const multiparty = require('multiparty');
const request = require('request');
const logger = require('econ-logger');

const s3Uploader = require('../AWS-util/s3-uploader');
const s3Downloader = require('../AWS-util/s3-downloader');
const s3Deleter = require('../AWS-util/s3-deleter');
const bucketName = require('../config/AWS.config').S3.bucketName;
const ROOT_ENDPOINT = require('../config/AWS.config').Lambda.ROOT_ENDPOINT;
const ENCRYPT_SUFFIX = require('../config/AWS.config').Lambda.EncryptSuffix;
const DECRYPT_SUFFIX = require('../config/AWS.config').Lambda.DecryptSuffix;

class CryptAPI {

  constructor(router) {
    this.router = router;
    this._init();
  }

  _init(){
    this.router.post('/encrypt', this.encrypt.bind(this));
    this.router.post('/decrypt', this.decrypt.bind(this));
  }

  _uploadAll(req){
    return new Promise((resolve, reject) => {
      let form = new multiparty.Form();
      let body = {};
      let promises = [];
      form.on('field', (name, value) => {
        console.log('field');
        body[name] = value;
      }).on('part', part => {
        console.log('part');
        promises.push(s3Uploader(bucketName, part));
      }).on('close',()=>{
        console.log('close');
        resolve({s3Promises: promises, body: body});
      }).on('error', reject);
      form.parse(req);
    });
  }

  _handler(formData, endpoint, res){
    Promise.all(formData.s3Promises)
      .then(async (results) => {
        let result = results.pop();
        if(result) {
          let body = formData.body;
          body.s3Reference = result;
          request.post({
            url: endpoint,
            json: body,
          }).on('data',(data)=> {
            let dataParse = JSON.parse(data.toString());
            logger.info(dataParse);
            s3Downloader(dataParse.Bucket, dataParse.Key).pipe(res).on('finish', () => {
              let deleteParam  ={Bucket: dataParse.Bucket, Key: dataParse.Key};
              s3Deleter(dataParse.Bucket, dataParse.Key).on('finish', () => logger.info({message: "Deleting Object in S3", deleteParam}));
            });
          });
        }
      });
  }

  encrypt(req, res) {
    this._uploadAll(req)
      .then(formData => {
        logger.info("Encrypting");
          this._handler(formData, ROOT_ENDPOINT + ENCRYPT_SUFFIX, res);
      });
  }

  decrypt(req, res) {
    this._uploadAll(req)
      .then(formData => {
        logger.info("Decrypting");
        this._handler(formData, ROOT_ENDPOINT + DECRYPT_SUFFIX, res);
      });
  }

}

module.exports = CryptAPI;