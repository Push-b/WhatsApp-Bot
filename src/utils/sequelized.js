import { getContentType } from "@whiskeysockets/baileys";
import fs from "fs";
import DB from "../connect/db.js";

const META_DATA = JSON.parse(fs.readFileSync("src/config.json", "utf-8"));
const user_db = new DB.UserDbFunc();
const group_db = new DB.GroupDbFunc();

const fetchUserData = async (id, filter) => {
  const user = await user_db.getUser(id);
  if (user) return user[filter];
  return null;
};

const fetchGroupData = async (id, filter) => {
  const group = await group_db.getGroup(id);
  if (group) return group[filter];
  return null;
};

const getMessageText = (message, messageType) => {
  return (
    message?.conversation ||
    message?.[messageType]?.text ||
    message?.[messageType]?.caption ||
    (message?.[messageType]?.selectedId
      ? Neko.prefix + message?.[messageType]?.selectedId
      : null) ||
    messageType ||
    ""
  );
};

const sequilizer = async (Neko, m) => {
  try {
    // console.log(m,m.message);
    if (m.key?.remoteJid === "status@broadcast") return;
    if (
      !m.key?.remoteJid.includes("@s.whatsapp.net") &&
      !m.key?.remoteJid.includes("@g.us")
    )
      return;
    const messageType = getContentType(m.message);
    const text = getMessageText(m.message, messageType);
    const from = m.key?.remoteJid;
    const isGroup = from?.endsWith("@g.us");
    const quotedMessageType = getContentType(
      m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
    );
    const isMe = m.key?.fromMe;
    const sender = isMe
      ? `${Neko?.user?.id?.split(":")[0]}@s.whatsapp.net`
      : isGroup
        ? m.key?.participant
        : from;

    const [
      isMod,
      isPro,
      isBanned,
      isStatusView,
      isGcBanned,
      isAntilink,
      isWelcome,
      isReassign,
      isChatAi,
    ] = await Promise.all([
      fetchUserData(sender, "isMod"),
      fetchUserData(sender, "isPro"),
      fetchUserData(sender, "isBanned"),
      fetchUserData(sender, "isStatusView"),
      fetchGroupData(from, "isBanned"),
      fetchGroupData(from, "isAntilink"),
      fetchGroupData(from, "isWelcome"),
      fetchGroupData(from, "isReassign"),
      fetchGroupData(from, "isChatAi"),
    ]);
    let groupMeta, admins, mode;
    if (isGroup) {
      groupMeta = await Neko.groupMetadata(from);
      admins = groupMeta.participants.filter((v) => v.admin).map((v) => v.id);
      mode = fetchGroupData(groupMeta.id, groupMeta.subject);
    } else {
      groupMeta = null;
      admins = [];
      mode = null;
    }
    const ownerNumber = META_DATA.ownerNumber.map((v) => `${v}@s.whatsapp.net`);
    const mUpdated = {
      ...m,
      messageType,
      text,
      prefix: META_DATA.prefix,
      from,
      isGroup,
      sender,
      groupMeta,
      groupOwner: groupMeta?.owner,
      admins,
      isAdmin: isGroup ? admins.includes(sender) : false,
      isOwner: ownerNumber.includes(sender),
      cmdName: text
        ?.slice(META_DATA.prefix.length)
        .trim()
        .split(" ")
        .shift()
        .toLowerCase(),
      args: text
        ?.slice(META_DATA.prefix.length + text.split(" ")[0].length)
        .trim(),
      isStatusView: ownerNumber.includes(sender) || isStatusView,
      isWelcome,
      isAntilink,
      isGcBanned,
      isBanned,
      isChatAi,
      isPro: ownerNumber.includes(sender) || isPro,
      isReassign,
      isCmd: text?.startsWith(META_DATA.prefix),
      mode,
      isBotMsg: !m.pushName,
      isBotAdmin: isGroup
        ? admins.includes(`${Neko.user.id.split(":")[0]}@s.whatsapp.net`)
        : false,
      isMod: ownerNumber.includes(sender) || isMod,
      isStatus:
        m.message?.extendedTextMessage?.contextInfo?.remoteJid?.includes(
          "status@broadcast",
        ),
      mention: m.message?.[messageType]?.contextInfo?.mentionedJid || [],
      quoted: {
        mtype: quotedMessageType?.replace("Message", ""),
        sender: m.message?.extendedTextMessage?.contextInfo?.participant,
        text: m.message?.extendedTextMessage?.contextInfo?.quotedMessage
          ?.conversation,
        message: m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
      },
      isMentioned:
        m.message?.[messageType]?.contextInfo?.mentionedJid?.length > 0,
      isQuoted: !!m.message?.extendedTextMessage?.contextInfo?.quotedMessage,
    };
    return mUpdated;
  } catch (error) {
    console.error(error);
    Neko.log("error", error);
    return m; // Returning the original message object in case of error
  }
};

export default sequilizer;
