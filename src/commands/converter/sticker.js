import { Sticker, StickerTypes } from "@shibam/sticker-maker";

export default {
  name: "sticker",
  aliases: ["s"],
  category: "converter",
  cooldown: 1,
  description: "Converts image to sticker",
  usage: "sticker [reply to image]",
  isPro: false,
  isMod: false,
  isGroup: false,
  isBotAdmin: false,
  isAdmin: false,
  run: async (Neko, M) => {
    try {
      if (
        !M.isQuoted &&
        M.messageType !== "imageMessage" &&
        M.messageType !== "videoMessage"
      ) {
        return await Neko.sendTextMessage(
          M.from,
          "Please reply to an image or video to convert it to sticker",
          M,
        );
      }
      if (
        M.quoted?.mtype !== "image" &&
        M.quoted?.mtype !== "video" &&
        M.messageType !== "imageMessage" &&
        M.messageType !== "videoMessage"
      ) {
        return Neko.sendTextMessage(
          M.from,
          "Please reply to an image or video",
          M,
        );
      }

      if (
        M.quoted.mtype === "image" ||
        M.quoted.mtype === "video" ||
        M.messageType !== "imageMessage" ||
        M.messageType !== "videoMessage"
      ) {
        let buffer = await Neko.downloadMediaContent(
          Neko,
          M.message?.imageMessage || M.message?.videoMessage ? M : M.quoted,
        );
        let sticker = new Sticker(buffer.data, {
          pack: "Shibam",
          author: "Neko-MD",
          category: ["🤩", "🎉"],
          quality: 7,
          type: StickerTypes.DEFAULT,
          text: M.args,
        });
        let buff = await sticker.toBuffer();
        await Neko.sendStickerMessage(M.from, buff, M);
      }
    } catch (error) {
      await Neko.error(error);
    }
  },
};
