export default {
  name: "pin",
  aliases: ["pinned"],
  desc: "pin messages",
  category: "fun",
  usage: `pin @tag/quoted the message`,
  cooldown: 5,
  isAdmin: false,
  isBotAdmin: false,
  isGroup: false,
  isOwner: false,
  isPro: false,
  isMod: false,
  run: async (Neko, M) => {
    try {
        await Neko.sendMessage(M.from,{
            pin: {
                type: true, // 0 to remove
                time: 86400,
                key: M.key
            }
        })
        await Neko.sendTextMessage(M.from,"Pinned Message",M)
    } catch (error) {
        await Neko.errror(error)
    }
  },
};
