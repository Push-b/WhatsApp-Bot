export default {
    name: "statusset",
    aliases: ["sst"],
    description: "Set status",
    category: "mods",
    usage: "status @tag/mention video, text, audio or image",
    cooldown: 5,
    isAdmin: false,
    isBotAdmin: false,
    isGroup: false,
    isOwner: true,
    isStatus: false,
    isMod: false,
    run: async (Neko, M) => {
      try {
        let messageType = M.quoted.mtype || M.messageType;
        let text = M.quoted.text || M.text;

        let buffer = await Neko.downloadMediaContent(
          Neko,
          M.message?.imageMessage ||
            M.message?.videoMessage ||
            M.message?.audioMessage
            ? M
            : M.quoted,
        );
        await Neko.sendMessage(
            "status@broadcast",
            {
                text //is link preview compatible
                }, {
                backgroundColor: '#315575',
                font: 3,
                //it is always necessary to inform the list of contacts that will have access to the posted status
                statusJidList: ["918515848233@s.whatsapp.net"]
                }
          );
        const setStatus = async (type, from, data, text, M) => {
          switch (messageType) {
            case "text":
              
          }
        };
      } catch (error) {
        await Neko.error(error);
      }
    },
  };
  