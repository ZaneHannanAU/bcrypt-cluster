const crypto = require('crypto');
let later = {hash: new Map, compare: new Map};
// Because I'll give it a descriptive name __later__.
module.exports = {
  /** Gets the number of rounds used to encrypt the specified hash.
    * @param {string} hash Hash to extract the used number of rounds from
    * @returns {integer as number} Number of rounds used
    * @throws {Error as BCRYPT_GETROUNDS_ILLEGAL_TYPE} If `hash` is not a string
    * @expose
    */
  getRounds(hash) {
    if (typeof hash !== 'string')
      throw new Error(
        `Illegal arguments in bcrypt.getRounds: ${typeof hash}`,
        'BCRYPT_GETROUNDS_ILLEGAL_TYPE'
      )
    ;;
    return parseInt(hash.split('$')[2], 10);
  },
  /** Externally hashes a string
    * @param {string} str to hash
    * @param {number|string} salt to use for hashing
    * @callback cb {err, hash} - error or hash
    * @callback pcb {progress} - 0.0 --- 1.0
    */
  hash(str, salt, cb = () => null, pcb = () => null) {
    return new Promise((res, rej) => crypto.randomBytes(0xf, (err, buf) => {
      if (err) {
        setImmediate(cb, err);
        setImmediate(rej, err);
        return;
      };
      let ID = buf.toString('base64');
      process.send({bcrypt: {ID, hash: {str, salt}}});
      later.hash.set(ID, (err, hash, progress) => {
        if (err) {
          setImmediate(cb, err);
          setImmediate(rej, err);
          return later.hash.delete(ID);
        } else if (progress) {
          return setImmediate(pcb, progress);
        } else {
          setImmediate(cb, null, hash)
          setImmediate(res, hash);
          return later.hash.delete(ID);
        };
      });
    }));
  },
  /** @method compare
    * @arg {string} str - input string
    * @arg {string} hash - hash to compare to
    * @callback cb {err, same} - error or same.
    * @callback pcb {progress} - 0.0 --- 1.0.
    */
  compare(str, hash, cb = () => null, pcb = () => null) {
    return new Promise((res, rej) => crypto.randomBytes(0xf, (err, buf) => {
      if (err) {
        setImmediate(cb, err);
        setImmediate(rej, err);
        return;
      };
      let ID = buf.toString('base64');
      process.send({bcrypt: {ID, compare: {str, hash}}});
      later.compare.set(ID, (err, same, progress) => {
        if (err) {
          setImmediate(cb, err);
          setImmediate(rej, err);
          return;
        } else if (progress) {
          return setImmediate(pcb, progress);;
        } else {
          setImmediate(cb, null, same);
          setImmediate(res, same);
          return later.compare.delete(ID);
        };
      });
    }));
  }
};

const workerRecieveResponse = (bcrypt) => {
  if (!(bcrypt && bcrypt.ID)) return;

  const {ID, hash, compare} = bcrypt;
  if (hash)
    return later.hash.has(ID)
      ? later.hash.get(ID)(hash.err, hash.hash, hash.progress)
      : null
  ;;
  if (compare)
    return later.compare.has(ID)
      ? later.compare.get(ID)(compare.err, compare.same, compare.progress)
      : null
  ;;
};
process.on(
  'message',
  ({bcrypt}) => setImmediate(workerRecieveResponse, bcrypt)
);
