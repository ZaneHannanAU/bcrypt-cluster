const cluster = require('cluster');
const crypto = require('crypto');

if (cluster.isMaster) exports = module.exports = require('./master')
else if (cluster.isWorker) exports = module.exports = require('./worker')
else throw new Error(
  'bcrypt-cluster: Unable to determine Master/Worker status',
  'BCRYPT_MASTERWORKER_INDETERMINATE'
)
;;
// bye
