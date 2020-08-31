const crypto = require('crypto');
const cbor = require('cbor');
const { InvalidTransaction, InternalError } = require('sawtooth-sdk/processor/exceptions')

const hash = (x) =>
    crypto.createHash('sha512').update(x).digest('hex').toLowerCase()

const decodeData = (buffer) =>
    new Promise((resolve, reject) =>
        cbor.decodeFirst(buffer, (err, obj) => (err ? reject(err) : resolve(obj)))
    )

const getNamespace = (family) => hash(family).substring(0, 6);

const getSenderAddress = (namespace, userPublicKey) => namespace + hash(userPublicKey).slice(-64);

module.exports = {
    hash,
    decodeData,
    getNamespace,
    getSenderAddress
}