let BCRYPT;
try {
  // Try and load bcrypt native module
  BCRYPT = require('bcrypt');
} catch (e) {
  // Load bcrypt javascript module (~130% time taken per iteration)
  BCRYPT = require('bcryptjs');
};

module.exports = exports = BCRYPT;
// We're done with loading, let's register some functions I guess.

const err2json = e => !e ? undefined : ({
  code: e.code, message: e.message,
  stack: e.stack, name: e.name
});

const masterRecieveRequest = (worker, bcrypt) => {
  if (!(bcrypt && bcrypt.ID)) return;

  const ID = bcrypt.ID;
  if (bcrypt.hash) {
    const {str, salt} = bcrypt.hash;
    BCRYPT.hash(str, salt, (err, hash) => {
      return worker.send({bcrypt: {ID, hash: {hash, err: err2json(err)}}});
    }, (progress) => {
      return worker.send({bcrypt: {ID, hash: {progress}}});
    });
    return;
  }
  if (bcrypt.compare) {
    const {str, hash} = bcrypt.compare;
    BCRYPT.compare(str, hash, (err, same) => {
      worker.send({bcrypt: {ID, compare: {same, err: err2json(err)}}});
    }, (progress) => {
      worker.send({bcrypt: {ID, compare: {progress}}});
    })
  }
};

cluster.on(
  'message',
  (worker, {bcrypt}) => setImmediate(masterRecieveRequest, worker, bcrypt)
);
