import Jimp from "jimp";
export default {
  name: "setbotpp",
  aliases: ["setbotpic", "setbotprofile"],
  description: "Set bot's profile picture",
  category: "mods",
  usage: "setbotpp [reply to image]",
  cooldown: 5,
  isAdmin: false,
  isBotAdmin: false,
  isGroup: false,
  isOwner: true,
  isPro: false,
  isMod: false,
  run: async (Neko, M) => {
    try {
      const quoted = M.quoted;
      if (!quoted.mtype === "image" && M.messageType !== "imageMessage") {
        await Neko.sendTextMessage(
          M.from,
          "Please reply to an image to set as bot profile picture",
          M
        );
        return;
      }

      const image = await Neko.downloadMediaContent(
        Neko,
        M.message?.imageMessage ? M : quoted
      );
      const { img } = await generatePP(image.data);

      await Neko.query({
        tag: "iq",
        attrs: {
          to: "@s.whatsapp.net",
          type: "set",
          xmlns: "w:profile:picture",
        },
        content: [
          {
            tag: "picture",
            attrs: { type: "image" },
            content: img,
          },
        ],
      });

      return await Neko.sendTextMessage(
        M.from,
        "Successfully changed bot's profile picture",
        M
      );
    } catch (error) {
      await Neko.error(error);
    }
  },
};

const generatePP = async (img) => {
  const jimp = await Jimp.read(img);
  const cropped = jimp.crop(0, 0, jimp.getWidth(), jimp.getHeight());

  let width = jimp.getWidth();
  let height = jimp.getHeight();
  let ratio;

  if (width > height) {
    ratio = jimp.getWidth() / 720;
  } else {
    ratio = jimp.getWidth() / 324;
  }

  width = width / ratio;
  height = height / ratio;

  const buffer = await cropped
    .quality(100)
    .resize(width, height)
    .getBufferAsync(Jimp.MIME_JPEG);

  return { img: buffer };
};
