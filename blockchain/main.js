const SHA256 = require("crypto-js/sha256");

class Block {
    constructor(index, timestamp, data, previousHash = '') {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = this.calculateHash();
        this.nonce = 0;
    }

    calculateHash() {
      return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }

    mineBlock(difficulty) {
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log("Блок добыт:" + this.hash); 
    }
}

class OldBlock {
    constructor(index, previousHash, timestamp, data, hash, nonce) {
        this.index = index;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.hash = hash;
        this.nonce = nonce;
    }

    calculateHashOldBlock() {
        return SHA256(this.index + this.previousHash + this.timestamp + JSON.stringify(this.data) + this.nonce).toString();
    }
}

class Blockchain{
    constructor() {
        this.chain = [];
        this.difficulty = 4;
    }

    getLatestBlock() {
        return this.chain[this.chain.length - 1];
    }

    addBlock(newBlock) {
        if (this.getLatestBlock() == null) {
            newBlock.previousHash = 0;
        } else {
            newBlock.previousHash = this.getLatestBlock().hash;
        }
        console.log('Начался процесс добытия блока, ожидайте...')
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
        //console.log("Данные в цепочке блоков");
        //console.log('\n');
        //console.log(JSON.stringify(this.chain, null, 10))
    }

    pushAgain(OldBlock) {
        this.chain.push(OldBlock);
    }

    isChainValid() {
        for (let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i - 1];

            if (currentBlock.hash !== currentBlock.calculateHashOldBlock()) {
                console.log("hash не совпадает!");
                return false;
            }

            if (currentBlock.previousHash !== previousBlock.hash) {
                return false;
            }
        }
        return true;
    }
}

module.exports.Block = Block;
module.exports.Blockchain = Blockchain;
module.exports.OldBlock = OldBlock;