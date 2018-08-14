const { Identity } = require('@twlv/core');

let identity = Identity.generate();
console.info(identity.privKey);
