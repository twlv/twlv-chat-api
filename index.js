const fs = require('fs');
const http = require('http');
const { Node, Identity } = require('@twlv/core');
const { SockJsListener } = require('@twlv/transport-sockjs');
const { WebRTCSignaler } = require('@twlv/transport-webrtc');
const { Commander } = require('./commander');

const debug = require('debug')('twlv-chat-api:-');

const PORT = process.env.PORT || 3000;
const NETWORK_ID = process.env.NETWORK_ID || 'twlv-chat';
const PRIV_KEY = process.env.PRIV_KEY || fs.readFileSync('./.twlv.key', 'utf-8');
const SOCKJS_PREFIX = process.env.SOCKJS_PREFIX || '/sock';

process.on('unhandledRejection', err => {
  console.error('unherr', err);
});

(async () => {
  debug('Starting twlv-chat-api...');
  debug(`Network Id  = ${NETWORK_ID}`);
  debug(`Sock Prefix = ${SOCKJS_PREFIX}`);

  let server = http.createServer();
  server.listen(PORT);

  let identity = new Identity(PRIV_KEY);

  let node = new Node({
    networkId: NETWORK_ID,
    identity,
  });
  node.addListener(new SockJsListener({ server, prefix: SOCKJS_PREFIX }));

  let signaler = new WebRTCSignaler(node);
  await signaler.start();
  debug('Signaler started');

  let commander = new Commander({ node });
  await commander.start();
  debug('Commander started');

  await node.start();
  debug('TWLV node started');
})();
