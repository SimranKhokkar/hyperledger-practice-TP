const { TransactionProcessor } = require('sawtooth-sdk/processor');
const TPHandler = require('./transactionProcessor');

const transactionProcessor = new TransactionProcessor('tcp://localhost:4004');

//Add Transaction Processor Handler to TP
transactionProcessor.addHandler(new TPHandler());
//Start Transaction Processor
transactionProcessor.start();