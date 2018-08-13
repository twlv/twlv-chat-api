const debug = require('debug')('twlv-chat-api:commander');

class Commander {
  constructor ({ node }) {
    this.node = node;
    this.peers = [];

    this._onMessage = this._onMessage.bind(this);
  }

  putPeer (address, profile) {
    let lastSeen = new Date();
    this.peers.push({ address, profile, lastSeen });
  }

  start () {
    this.node.on('message', this._onMessage);
  }

  stop () {
    this.node.removeListener('message', this._onMessage);
  }

  async sendReply (to, command, data) {
    try {
      await this.node.send({
        to,
        command: `twlv-chat-api:${command}`,
        payload: JSON.stringify(data),
      });
    } catch (err) {
      console.error('sendreply err', err);
    }
  }

  async _onMessage (message) {
    if (!message.command.startsWith('twlv-chat-api:')) {
      return;
    }

    let from = message.from;
    let command = message.command.split('twlv-chat-api:').pop();
    let data = JSON.parse(message.payload);

    debug('cmd', command);
    let fn;
    try {
      fn = require(`./commands/${command}`);
    } catch (err) {
      debug('Invalid command handler "%s"', command);
    }

    if (fn) {
      try {
        let reply = await fn({ ctx: this, from, data });
        if (typeof reply !== 'undefined') {
          await this.sendReply(from, command, reply);
        }
      } catch (err) {
        console.error('Message handler err', err);
      }
    }
  }
}

module.exports = { Commander };
