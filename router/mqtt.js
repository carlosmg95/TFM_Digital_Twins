// Own modules
const {models} = require('../controllers')

// ====================================================================================================================
// Route definition
// ====================================================================================================================

module.exports = function(client) {
    client.subscribe('dgiotwins/user/:username/stage/:stageid', models.readData)
    /*client.subscribe('/users/:userid/message/:messageid/:method', function(topic, payload, message) {
        console.log('-------------------------------------------------');
        console.log('topic  :', topic);             // /users/taoyuan/message/4321/ping
        console.log('message:', payload);           // { hello: 'world' }
        console.log('params :', message.params);    // { userid: 'taoyuan', messageid: 4321 }
        console.log('slats  :', message.splats);    // [ 'ping' ]
        console.log('path   :', message.path);      // '/users/:userid/message/:messageid/:method'
        console.log('packet :', message.packet);    // {...} packet received packet, as defined in mqtt-packet
        console.log();
    })*/
}