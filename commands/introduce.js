module.exports = async function introduce ({ ctx, from, data }) {
  await ctx.putPeer(from, data);
};
