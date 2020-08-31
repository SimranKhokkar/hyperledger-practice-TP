const cbor = require('cbor')
const { getSenderAddress } = require('../transactionProcess/lib/helper');

class TPItem {
  /**
   * TPItem Constructor
   * @param Object context
   * @param Object data
   * @param String userPublicKey
   * @param Object familyDetails
   */

  constructor(context, payload, namespace) {
    this.context = context;
    this.namespace = namespace;
    this.transactionType = payload.transactionType;
    this.data = payload.data;
    this.userPublicKey = payload.userPublicKey;
  }

  /**
   * This function is to take action accordingly the transactionType name
   */

  takeAction() {
    let actionFn;
    const senderAddress = getSenderAddress(this.namespace, this.userPublicKey);
    if (this.transactionType === 'add' && this.checkValid()) {
      actionFn = this.addData;
    } else {
      actionFn = null;
    }
    if (actionFn) {
      const getPromise = this.getState(senderAddress);
      const actionPromise = getPromise
        .then((possibleValues) => actionFn(
          possibleValues, this.data, senderAddress, this.context,
        ))
        .catch((err) => {
          console.error('Error in transactionItem',err);
        });
      return actionPromise;
    }
    return actionFn;
  }

  /**
   * This function is to check if the payload is valid or not
   */

  checkValid() {
      return true
    // Validation of the data
  }

  /**
   * This function is to Get the Sender address from a publickey
   */

  getAddress() {
    
  }

  /**
   * This function is to Get the current State of a blockchain
   * @param String senderAddress
   */

  getState(senderAddress) {
    return this.context.getState([senderAddress]);
  }

  /**
   * This function is to ADD data to Heath Data
   */

  // eslint-disable-next-line class-methods-use-this
  addData(stateValueRep, data, senderAddress, context) {
    return new Promise((resolve, reject) => {
      console.log('data in add',data);
      
      const entry = {
        [senderAddress]: cbor.encode(JSON.stringify(data))
      };
      context.setState(entry);
      // setState(1) can be used if constant values are being assigned
      // setState(data) for dynamic data
      resolve(data);
    });
  }

  /**
   * This function is to Update TP Data
   */

  // eslint-disable-next-line class-methods-use-this
  updateData(stateValueRep, data, senderAddress, context, protobufInfo) {
    return new Promise((resolve, reject) => {
      // updating data from state
    });
  }


  /**
  * This function is to remove data from TP Data items
  */

  // eslint-disable-next-line class-methods-use-this
  removeData(stateValueRep, data, senderAddress, context, protobufInfo) {
    return new Promise((resolve, reject) => {
      // Removing state
    });
  }
}

module.exports = TPItem;