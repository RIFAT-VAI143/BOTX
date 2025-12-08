module.exports = {
 config: {
 name: "out",
 author: "rifat",
 role: 2, 
 shortDescription: "Make the bot leave the group",
 category: "admin",
 guide: "{pn}"
 },

 onStart: async function ({ api, event }) {
 const threadID = event.threadID;

 // Check if it's a group chat
 const threadInfo = await api.getThreadInfo(threadID);
 if (!threadInfo.isGroup) {
 return api.sendMessage("❌ This Command Can Only Be Used In Group Chats.", threadID);
 }

 await api.sendMessage("Tata 💗! Allah hafez 💗🫶🏻  ...", threadID, () => {
 api.removeUserFromGroup(api.getCurrentUserID(), threadID);
 });
 }
};