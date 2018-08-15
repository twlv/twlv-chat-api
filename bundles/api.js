const Bundle = require('bono');

class Api extends Bundle {
  constructor ({ node, commander }) {
    super();

    this.node = node;
    this.commander = commander;

    this.use(require('bono/middlewares/json')());

    this.get('/', this.index.bind(this));
    this.get('/connections', this.getConnections.bind(this));
  }

  index (ctx) {
    return {
      name: 'twlv-chat-api',
    };
  }

  getConnections (ctx) {
    return this.node.connections.map(connection => connection.peer);
  }
}

module.exports = { Api };
