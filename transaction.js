const { createContext, CryptoFactory } = require('sawtooth-sdk/signing')
const { createHash } = require('crypto')
const cbor = require('cbor')
const { protobuf } = require('sawtooth-sdk')
const request = require('request')
const path = require('path');
const fs = require('fs');
const jsonfile = require('jsonfile');

const helper = require('./lib/helper');

const context = createContext('secp256k1')
const privateKey = context.newRandomPrivateKey()
const signer = new CryptoFactory(context).newSigner(privateKey)

const address = path.join(__dirname, 'publicKeyPayloadData.json');

/**
   * This function is to post data using TP
*/

const sendRequest = (payload) => {

  let saveInFile = jsonfile.readFileSync(address);
  saveInFile['request'] =payload;
  fs.writeFileSync(address, JSON.stringify(saveInFile, null, 4), {spaces: 2});
const payloadBytes = cbor.encode(payload)

const input = helper.getSenderAddress(helper.getNamespace('first_TP'), signer.getPublicKey().asHex());
// make input for get 

const transactionHeaderBytes = protobuf.TransactionHeader.encode({
    familyName: 'first_TP',
    familyVersion: '1.0',
    inputs: [input],
    outputs: [input],
    signerPublicKey: signer.getPublicKey().asHex(),
    batcherPublicKey: signer.getPublicKey().asHex(),
    dependencies: [],
    payloadSha512: createHash('sha512').update(payloadBytes).digest('hex'),
    nonce: (new  Date()).toString()
  }).finish()

  const signature = signer.sign(transactionHeaderBytes)

  const transaction = protobuf.Transaction.create({
    header: transactionHeaderBytes,
    headerSignature: signature,
    payload: payloadBytes
 })
 
 const transactions = [transaction];

 const batchHeaderBytes = protobuf.BatchHeader.encode({
    signerPublicKey: signer.getPublicKey().asHex(),
    transactionIds: transactions.map((txn) => txn.headerSignature),
 }).finish()
 
 headerSignature = signer.sign(batchHeaderBytes)

 const batch = protobuf.Batch.create({
    header: batchHeaderBytes,
    headerSignature: headerSignature,
    transactions: transactions
  })
 
  const batchListBytes = protobuf.BatchList.encode({
    batches: [batch]
  }).finish()

  request.post({
    url: 'http://localhost:8008/batches',
    body: batchListBytes,
    headers: { 'Content-Type': 'application/octet-stream' }
  }, (err, response) => {
    if (err) return  console.log(err)
    console.log(response.body)
  })
}

  /**
   * This function is to Get the data from a state using REST API
  */

  const getStateData = (address) => {
    return new Promise((resolve, reject) => {
      console.log('state address', getStateAddress);
      const options = {
        'method': 'GET',
        'url': `http://localhost:8008/state/${address}`,
        'headers': {}
      };
      request(options, (error, response) => {
        if (error) reject(error);
        else {
          const dataObject = JSON.parse(response.body);
          const decodedData = Buffer.from(dataObject.data, 'base64').toString();
          resolve(decodedData);
        }
      });
    });
  }

const payload = {transactionType: 'add', data: {name: 'Simran'}, userPublicKey: signer.getPublicKey().asHex()};
sendRequest(payload);

// GET call
let fileData = jsonfile.readFileSync(address);
const publicKey = fileData.request.userPublicKey;
let getStateAddress = helper.getSenderAddress(helper.getNamespace('first_TP'), publicKey);
getStateData(getStateAddress).then((stateData) => {
  console.log('State data:', JSON.parse(stateData.substring(1)));
}).catch((err) => {
  console.log('Error', err);
});
