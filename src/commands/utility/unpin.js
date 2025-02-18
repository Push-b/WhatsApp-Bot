export default {
  name: "unpin",
  aliases: ["unpinned"],
  desc: "unpin messages",
  category: "fun",
  usage: `unpin quoted pinned the message`,
  cooldown: 5,
  isAdmin: false,
  isBotAdmin: false,
  isGroup: false,
  isOwner: false,
  isPro: false,
  isMod: false,
  run: async (Neko, M) => {
    try {
      await Neko.sendMessage(M.from, {
        pin: {
          type: 0, // 0 to remove
          time: 2592000,
          key: M.key,
        },
      });
      await Neko.sendTextMessage(M.from, "UnPinned Message", M);
    } catch (error) {
      await Neko.errror(error);
    }
  },
};
