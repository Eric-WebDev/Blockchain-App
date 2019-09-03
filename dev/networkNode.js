const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const Blockchain = require("./blockchain");
const block = new Blockchain();
const uuid = require("uuid/v1");
const port = process.argv[2];
const rp = require("request-promise");
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
//register node and broadcast to network (complicated)
app.post("/register-and-broadcast-node", function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  if (bitcoin.networkNodes.indexOf(newNodeUrl) == -1)
    block.networkNodes.push(newNodeUrl);
  block.networkNodes.forEach(networkNodeUrl => {
    const requestOptions = {
      uri: networkNodeUrl + "/register-node",
      method: "POST",
      body: { newNodeUrl: newNodeUrl },
      json: true
    };
    regNodesPromises.push(rp(requestOptions));
  });
  Promise.all(regNodesPromises)
    .then(data => {
      const bulkRegisterOptions = {
        uri: newNodeUrl + "/register-node-bulk",
        method: "POST",
        body: {
          allNetworkNodes: [...block.networkNodes, block.networkNodeUrl]
        },
        json: true
      };
      return rp(bulkRegisterOptions);
    })
    .then(data => {
      res.json({ note: "New node registred successfuly." });
    });
});
//register node with network
app.post("/register-node", function(req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = block.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = block.CurrentNode !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode)
    block.networkNodes.push(newNodeUrl);
  res.json({ note: "New node registred " });
});
//register multiple nodes at once
app.post("/register-nodes-bulk", function(req, res) {
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.foreach(networkNodeUrl => {
    const nodeNotAlreadyPresent = block.networkNodes.ind(networkNodeUrl) == -1;
    const notCurrentNode = block.CurrentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode)
      block.networkNodes.push(networkNodeUrl);
  });
  res.json({ note: "Bulk registartion successful" });
});



app.listen(port, function() {
  console.log(`listening on port ${port}....`);
});
