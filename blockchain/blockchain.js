const {Block, Blockchain, OldBlock} = require('./main');
const ObjectID = require('mongodb').ObjectID;

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

const fiksBlock = new Blockchain();

let getAB = new Promise(function(resolve, reject) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
  
      db.db("mongouploads").collection("blocks").find({}).toArray(function(err, result){
        if (err) throw err;
        console.log("Добавление блоков из базы в локальную цепочку...");
        for (let i = 0; i < result.length; i++){
          var index = result[i].chain.index;
          var previousHash = result[i].chain.previousHash;
          var timestamp = result[i].chain.timestamp;
          var data = result[i].chain.data;
          var hash = result[i].chain.hash;
          var nonce = result[i].chain.nonce;
          fiksBlock.pushAgain(new OldBlock(index, previousHash, timestamp, data, hash, nonce));
        }
        //console.log(JSON.stringify(fiksBlock.chain, null, 10));
        //if(fiksBlock.isChainValid()) {
        //    console.log("Готово!");
        //} else {
        //    throw "Цепочка данных не валидна, обратись с всевышнему..."
        //}
        console.log('Цепочка блоков валидна?', fiksBlock.isChainValid() ? 'Да' : 'Нет');        
        db.close();
      });
    });
    return true;
})

//Получаем количество документов и передаем это количество с данными, в функцию secondStep
function firstStep(data) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        db.db("mongouploads").collection("blocks").countDocuments({},{}, async function(err, result) {
            if (err) throw err;
            db.close();
            if(result === 0) {
                console.log("Отсутствуют записи в цепочке блоков. Создание genesisBlock..");
                await createGenesisBlock();
                return secondStep(result+1, data); //В базе, без +1, индекс документа после добавления genesis блока, будет 0
            } else {
                return secondStep(result, data);
            }
        });
    });
};

//Формируем блок и вызываем ф-ию, которая добавляет блок в базу(addBlockInDB)
function secondStep(callback, data) {
    var finalData;
    fiksBlock.addBlock(new Block(callback, Date.now(), data)); 
    /*
    Эта проверка необходима при создании genesisblock-а. Так как в случае, если
    база пустая, то в массив с индексом [0] записаны данные genesis блока, а нормальные данные
    идут в массиве под индексом [1]
    */
    if (fiksBlock.chain[fiksBlock.chain.length - 1] != []) {
        finalData = [{_id: null, chain: fiksBlock.chain[fiksBlock.chain.length - 1]}];
    }
    else {
        finalData = [{_id: null, chain: fiksBlock.chain[fiksBlock.chain.length]}];
        console.log("Последний блок" + fiksBlock.chain[fiksBlock.chain.length]);
    }
    addBlockInDB(finalData);
};

function addBlockInDB(finalData) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        db.db("mongouploads").collection("blocks").insertMany(finalData, function(err, res) {
            if (err) throw err;
            console.log("Добавлен блок с данными:");
            //console.log(finalData);
            console.log(JSON.stringify(finalData, null, 10));
            db.close();
        });
    });
};

function createGenesisBlock() {
    fiksBlock.addBlock(new Block(0, Date.now(), "Genesis block", "0"));
    var finalData = [{_id: null, chain: fiksBlock.chain[0]}];
    addBlockInDB(finalData);
    return true;
}

function getLatestBlock() {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
        if (err) throw err;
        db.db("mongouploads").collection("blocks").find().sort({_id:-1}).limit(1).toArray(function(err, result){
            if (err) throw err;
            db.close();
            console.log("Содержание последнего блока:" + " " + result);
            return result;
        });
    });
};

function findAndAddDocument(id) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
  
      var dbo = db.db("mongouploads");
      dbo.collection("uploads.files").find({ "_id": ObjectID(id) }).toArray(function(err, result){
        if (err) throw err;
        firstStep(result);
        db.close();
      });
  
    });
  };
  
function addMeta(id) {
    MongoClient.connect(url, { useNewUrlParser: true }, function(err, db) {
      if (err) throw err;
  
      var dbo = db.db("mongouploads");
      var myquery = { "_id": ObjectID(id) };
      var newvalues = {$set: {"metadata": {"inBlock":1}} };
      dbo.collection("uploads.files").updateOne(myquery, newvalues, function(err, res) {
        if (err) throw err;
        console.log("Добавлена пометка, что файл находиться в цепочке блоков");
        db.close();
      });
  
    });
  }

module.exports.addInBCAndDB = async (req, res) => {
    if (req.params.id.length === 24) {
        console.log("ID объекта, который передаётся для добавления в блокчейн:" + " " + req.params.id);
        await addMeta(req.params.id);
        findAndAddDocument(req.params.id);
    } else {
    console.log("Некорректный id, который вы хотите передать для добавления элемента в цепочку блоков")
    }
    res.redirect('/files/getFiles');
};
