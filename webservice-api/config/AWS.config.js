module.exports.S3 = {
    bucketName : "dev-simple-bucket"
};

module.exports.Lambda = {
    EncryptEndpoint: 'https://y7tmiaoy3l.execute-api.eu-west-1.amazonaws.com/devmax/encrypt',
    DecryptEndpoint: 'https://y7tmiaoy3l.execute-api.eu-west-1.amazonaws.com/devmax/decrypt'
};