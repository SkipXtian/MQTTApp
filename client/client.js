var util = require('util');

//Mongo DB setup
var dburl = 'localhost/mongoTest';
var collections = ['testCollection'];
var db = require('mongojs').connect(dburl, collections);

db.on('error', function(err) {
  console.log('database error', err);
});

db.on('ready',function() {
  console.log('database connected');
});

//MQTT setup
var mqtt = require('mqtt')
 
setClient = mqtt.createClient(1883, 'localhost');
setClient.subscribe('/set');
 
//Set up a stock model object
function stock(item, qty) {
  this.item = item;
  this.qty = qty;
}

setClient.on('message', function(topic, message) {
  var splitMsg = message.toString().split(",");
  var storeItem = new stock(splitMsg[0], splitMsg[1]);
  
  //console.log(msgStr);
  
  db.testCollection.save(storeItem, function(err, stored) {
    if( err || !stored ) console.log("Msg " + storeItem.item + " not saved because err:" + err);
    else console.log("Msg " + storeItem.item + " saved.");
  });
});


getClient = mqtt.createClient(1883, 'localhost');
getClient.subscribe('/get');

getClient.on('message', function(topic, message) {
  //db.testCollection.find( { item : 'pen' }, function(err, found) {
  //var query = { item : 'pen' };
  var buildMsg = '{ \"item\" : \"' + message.toString() + '\" }';
  console.log(buildMsg);
  var query = JSON.parse(buildMsg);
  db.testCollection.find(query, function(err, found) {
    if( err || !found ) console.log("Item: " + message.toString() + " not found.");
    else found.forEach( function(foundItem) { 
      console.log(util.inspect(foundItem, false, null));
    });
  });
});

console.log('Set & Get Clients started...');



  //var splitMsg = msgStr.split(",");  

