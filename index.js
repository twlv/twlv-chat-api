const fs = require('fs');
const http = require('http');
const { Node, Identity } = require('@twlv/core');
const { SockJsListener } = require('@twlv/transport-sockjs');
const { WebRTCSignaler } = require('@twlv/transport-webrtc');
const { Commander } = require('./commander');
const { Api } = require('./bundles/api');

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

  let identity = new Identity(PRIV_KEY);

  let node = new Node({
    networkId: NETWORK_ID,
    identity,
  });

  let signaler = new WebRTCSignaler(node);
  let commander = new Commander({ node });
  let api = new Api({ node, commander });

  let server = http.createServer(api.callback());
  server.listen(PORT);

  node.addListener(new SockJsListener({ server, prefix: SOCKJS_PREFIX }));

  await signaler.start();
  debug('Signaler started');
  await commander.start();
  debug('Commander started');
  await node.start();
  debug('TWLV node started');
})();
