const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const block = new Blockchain();
const uuid = require("uuid/v1");
const port = process.argv[2];
const nodeAddress = uuid()
  .split("-")
  .join("");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//end points , foundation api
app.get("/blockchain", function(req, res) {
  res.send(block);
});
//create new transaction
app.post("/transaction", function(req, res) {
  const blockIndex = block.createNewTransaction(
    req.body.amount,
    req.body.sender,
    req.body.recipient
  );
  res.json({ note: `Transaction added to block ${blockIndex}` });
});
//mine block
app.get("/mine", function(req, res) {
  const lastBlock = block.getLastBlock();
  const previousBlockHash = lastBlock["hash"];
  const currentBlockData = {
    transactions: block.pendingTransactions,
    index: lastBlock["index"] + 1
  };
  const nonce = block.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = block.hashBlock(previousBlockHash, currentBlockData, nonce);
  block.createNewTransaction(12.5, "00", nodeAddress);
  const newBlock = block.createNewBlock(nonce, previousBlockHash, blockHash);
  res.json({
    note: "new block mine sucesfully",
    block: newBlock
  });
});



app.listen(port, function() {
  console.log(`listening on port ${port}....`);
});
