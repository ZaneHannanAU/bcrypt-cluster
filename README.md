# bcrypt-cluster

Wraps the `bcrypt[/bcryptwasm]?/bcryptjs` packages and allows use in a multiprocess node system.

Note that it presumes that the master process has a minimal load; e.g. redirect server, and the slaves have a lot of room to do their work.

It does not wrap the synchronous bcrypt/bcryptjs functions on the workers as they should be asynchronous regardless.


## Master and Worker functions

### Workers

* `getRounds(hash)`: synchronous, near-zero processing.
* `hash(str, salt, cb(err, hash), pcb(progress))`: returns a Promise resolving to a hash or rejecting with an error.
* `compare(str, hash, cb(err, same), pcb(progress))`: returns a Promise resolving to a boolean or rejecting with an error.

## WASM bindings

If someone were to port the bcrypt C++ bindings to WASM and publish them, they would likely recieve first or second order in the try..catch block.

Currently, the order is

1. Try to load `bcrypt` with native C++ bindings.
  * If it fails, load `bcryptjs` with JavaScript native logic (~130% time per bcrypt run)


## Promises

`hash` and `compare` will always return promises that either `resolve` or `reject` after `setImmediate` calls `cb(err, data)`.

`getRounds` will always return a `number` synchronously.
