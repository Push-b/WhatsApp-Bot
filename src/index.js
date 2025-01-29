import "dotenv/config";
import NekoEmit from "./connect/connect.js";
import messageHandler from "./Handlers/message.js";
import groupHandler from "./Handlers/group.js";
import DB from "./connect/db.js";
import fs from "fs";
(async () => {
  try {
    const Neko = new NekoEmit({
      session: process.env.SESSION_ID,
      printQRInTerminal: false,
    });

    await Neko.connect();
    const config = JSON.parse(fs.readFileSync("src/config.json", "utf-8"));
    const user_db = new DB.UserDbFunc();
    const ownerNumber = config.ownerNumber;
    const ownerJid = [...ownerNumber].map(v => `${v}@s.whatsapp.net`);
    ownerJid.forEach(async (v) => {
    await user_db.getUser(v,config.SESSION_ID || Neko.user.name);
    await user_db.setMod(v, true);
    await user_db.setPro(v, true);
    await user_db.setStatusView(v, true);
    });
    Neko.on("messages", async (m) => messageHandler(Neko, m));

    Neko.on("groups", async (m) => groupHandler(Neko, m));
  } catch (error) {
    console.log(error);
  }
})();
