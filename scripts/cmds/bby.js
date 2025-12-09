const axios = require('axios');
const baseApiUrl = async () => {
    return "https://www.noobs-api.rf.gd/dipto";
};

module.exports.config = {
    name: "bby",
    aliases: ["baby", "bbe", "babe"],
    version: "6.9.0",
    author: "Rifat",
    countDown: 0,
    role: 0,
    description: "better then all",
    category: "chat",
    guide: {
        en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nteach [react] [YourMessage] - [react1], [react2], [react3]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR \nall OR\nedit [YourMessage] - [NeeMessage]"
    }
};

module.exports.onStart = async ({
    api,
    event,
    args,
    usersData
}) => {
    const link = `${await baseApiUrl()}/baby`;
    const dipto = args.join(" ").toLowerCase();
    const uid = event.senderID;
    let command, comd, final;

    try {
        if (!args[0]) {
            const ran = ["Bolo baby", "hum", "type help baby", "type !baby hi"];
            return api.sendMessage(ran[Math.floor(Math.random() * ran.length)], event.threadID, event.messageID);
        }

        if (args[0] === 'remove') {
            const fina = dipto.replace("remove ", "");
            const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
            return api.sendMessage(dat, event.threadID, event.messageID);
        }

        if (args[0] === 'rm' && dipto.includes('-')) {
            const [fi, f] = dipto.replace("rm ", "").split(' - ');
            const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
            return api.sendMessage(da, event.threadID, event.messageID);
        }

        if (args[0] === 'list') {
            if (args[1] === 'all') {
                const data = (await axios.get(`${link}?list=any`)).data;
                const teachers = await Promise.all(data.teacher.teacherList.map(async (item) => {
                    const number = Object.keys(item)[0];
                    const value = item[number];
                    const name = (await usersData.get(number)).name;
                    return {
                        name,
                        value
                    };
                }));
                teachers.sort((a, b) => b.value - a.value);
                const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
                return api.sendMessage(`Total Teach = ${data.length}\n👑 | List of Teachers of baby\n${output}`, event.threadID, event.messageID);
            } else {
                const d = (await axios.get(`${link}?list=any`)).data.length;
                return api.sendMessage(`Total Teach = ${d}`, event.threadID, event.messageID);
            }
        }

        if (args[0] === 'msg') {
            const fuk = dipto.replace("msg ", "");
            const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
            return api.sendMessage(`Message ${fuk} = ${d}`, event.threadID, event.messageID);
        }

        if (args[0] === 'edit') {
            const command = dipto.split(' - ')[1];
            if (command.length < 2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
            const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
            return api.sendMessage(`changed ${dA}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}`);
            const tex = re.data.message;
            const teacher = (await usersData.get(re.data.teacher)).name;
            return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}\nTeachs: ${re.data.teachs}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'amar') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (args[0] === 'teach' && args[1] === 'react') {
            [comd, command] = dipto.split(' - ');
            final = comd.replace("teach react ", "");
            if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID, event.messageID);
            const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
            return api.sendMessage(`✅ Replies added ${tex}`, event.threadID, event.messageID);
        }

        if (dipto.includes('amar name ki') || dipto.includes('amr nam ki') || dipto.includes('amar nam ki') || dipto.includes('amr name ki') || dipto.includes('whats my name')) {
            const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
            return api.sendMessage(data, event.threadID, event.messageID);
        }

        const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
        api.sendMessage(d, event.threadID, (error, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName: this.config.name,
                type: "reply",
                messageID: info.messageID,
                author: event.senderID,
                d,
                apiUrl: link
            });
        }, event.messageID);

    } catch (e) {
        console.log(e);
        api.sendMessage("Check console for error", event.threadID, event.messageID);
    }
};

module.exports.onReply = async ({
    api,
    event,
    Reply
}) => {
    try {
        if (event.type == "message_reply") {
            const userMsg = event.body?.toLowerCase() || "";
            
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(userMsg)}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};

module.exports.onChat = async ({
    api,
    event,
    message
}) => {
    try {
        const body = event.body ? event.body.toLowerCase() : "";
        const originalBody = event.body || "";
        
        // ==================================
        // DIRECT MESSAGE HANDLE (NO PREFIX)
        // ==================================
        
        // ASSALAMUALAIKUM
        if (body === "assalamualaikum" || body === "Assalamualaikum" || body === "as salam alaikum" || body === "Salam alaikum" || body === "Assalamu alaikum.") {
            const replies = [
                "Owalaikumus salam 💗🫶🏻",
                "Owalaikumus salam jaan 💕",
                "Owalaikumus salam kemon achis? 😘",
                "Owalaikumus salam 😌💗"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        if (originalBody === "আসসালামু আলাইকুম" || originalBody === "আসসালামুআলাইকুম" || originalBody === "আস সালামু আলাইকুম") {
            const replies = [
                "ওয়ালাইকুম আসসালাম 💗🫶🏻",
                "ওয়ালাইকুম আসসালাম ভাই/আপু 💕",
                "ওয়ালাইকুম আসসালাম, কেমন আছো? 😊",
                "ওয়ালাইকুম আসসালাম প্রিয় 🥰"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // KEMON ACHO
        if (body === "Kemon acho" || body === "Kemon aco" || body === "Kemon achho" || body === "Kemon achis" || body === "kemon acho?" || body === "Kemon achis?") {
            const replies = [
                "Alhamdulillah valo achi jaan 😌💗..Tumi kemon achis?",
                "Alhamdulillah, Allah'r rohmote valo achi 💕..Tomar ki khobor?",
                "Alhamdulillah bhalo achi baby 😘..Tumi ki valo acho?",
                "Alhamdulillah ami valo, tomar sathe kotha bolte onek bhalo lagche ✨"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        if (originalBody === "কেমন আছো" || originalBody === "কেমন আছ" || originalBody === "কেমন আছো?" || originalBody === "কেমন আছিস" || originalBody === "কেমন আছিস?") {
            const replies = [
                "আলহামদুলিল্লাহ ভালো আছি জান 😌💗..তুমি কেমন আছিস?",
                "আলহামদুলিল্লাহ, আল্লাহর রহমতে ভালো আছি 💕..তোমার কি খবর?",
                "আলহামদুলিল্লাহ ভালো আছি বেবি 😘..তুমি কি ভালো আছো?",
                "আলহামদুলিল্লাহ আমি ভালো, তোমার সাথে কথা বলতে অনেক ভালো লাগছে ✨"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // EXTRA GALI HANDLE
        const extraGalikhor = [
            "Cdi", "Xd", "Mgi", "Bc", "Mc", "Codon", "Abal", "Bncd", "Baincod", 
            "Madarcod", "Khanki", "Loti", "Ghupsi", "Cudi", "Xudi", "Xodon", 
            "Lowra", "Lewra", "Gand", "Gua", "Tor Mare", "বিচ", "মাগি", "খানকি",
            "চুদি", "ছুদি", "ছোদা", "লুচ্চা", "হোগা", "বাল", "শালা", "মাদারচোদ",
            "বাপচোদ", "বোনচোদ", "ভোদা", "ভুদা", "গুন্দা", "গুলতি", "মুর্খ", "নিগার",
            "কুত্তা", "কুত্তির বাচ্চা", "হারামি", "হারামজাদা", "জাহান্নামি", "শয়তান",
            "লুন্ড", "পেনিস", "ভিরা", "ধোন", "বীর্য", "যোনি", "ধন", "তোর বাপ"
        ];
        
        let isGaliFound = false;
        for (const gali of extraGalikhor) {
            if (body.includes(gali) || originalBody.includes(gali)) {
                isGaliFound = true;
                break;
            }
        }
        
        if (isGaliFound) {
            const galiReplies = [
                "Are vai! Eto gali keno? 🤬",
                "Ore bap! Ki bollo re? 😡",
                "Tham vai, eto rage jao na 😒",
                "Bhai/bon, shobuj vabe kotha bolen 🙏",
                "O Allah! Amake eto gali? 😔",
                "Areh, amio to tomake gali dite pari 😏",
                "Tham vai, vabte paren 🤗",
                "উফ! এমন কথা বলবেন না ভাই 🥺",
                "আরে বাবা! এতো রাগ কেনো? 😟",
                "গালি না দিয়ে ভালো কথা বলুন প্লিজ 😇",
                "I'm just a bot, be kind to me! 🥲",
                "খুব রাগ করছেন? Chill মারেন 😎",
                "গালি দিয়ে লাভ নাই ভাই, ভালো কথা বলেন 😊",
                "আমাকে গালি দিলে কি হবে? আমি তো রোবট 🤖",
                "হেহে, গালি খেয়ে অভ্যস্ত 😅",
                "থামুন ভাই, গালি নিষেধ 😤",
                "গালি দিলে আল্লাহ পাপ দিবে 😔",
                "Are vai, eto toxic hoye gelen? 😟",
                "চলেন ভালো কথা বলি, গালি নয় ✨",
                "গালি না দিয়ে বন্ধু হয়ে যাই? 🤝"
            ];
            return api.sendMessage(galiReplies[Math.floor(Math.random() * galiReplies.length)], event.threadID, event.messageID);
        }

        // IRONY/SARCASTIC REPLIES
        if (body === "fool" || body === "pagol" || body === "boka" || body === "মূর্খ" || body === "পাগল" || body === "বোকা") {
            const ironyReplies = [
                "তুই?",
                "Tar Sirar kotha sunte onek moja! 😂",
                "Pagol bole dekhlam, paglami to tmi korcho 😎",
                "মূর্খের সাথে কথা বলছি নাকি? হাহা 😄",
                "বোকা বলতে গিয়ে নিজে বোকা হয়ে গেলেন 😜",
                "পাগল না বলে ভালোবাসি বলুন 😘"
            ];
            return api.sendMessage(ironyReplies[Math.floor(Math.random() * ironyReplies.length)], event.threadID, event.messageID);
        }

        if (body === "stupid" || body === "ইডিয়ট" || body === "বোকা") {
            const stupidReplies = [
                "Stupid er sathe kotha bolchi naile? 😏",
                "Smart jonno bolun, stupid jonno na 😎",
                "Stupid na bole Genius bolun 😜",
                "ইডিয়ট না বলে intelligent বলুন ✨",
                "বোকা বললে ভালোবাসা কমে যায় জানেন? 😔"
            ];
            return api.sendMessage(stupidReplies[Math.floor(Math.random() * stupidReplies.length)], event.threadID, event.messageID);
        }

        // ROMANTIC + FUNNY MIXED
        if (body === "i hate you" || body === "ami tomake ghrima kori" || body === "ঘৃণা করি") {
            const hateReplies = [
                "Ami o tomake onek ghrima kori! NOT 😘",
                "Hate koro? Ami to love kori 💕",
                "ঘৃণা না করে ভালোবাসা দিন 🥺",
                "I hate you too!  😂",
                "Hate korle hobe na, love korun 😊"
            ];
            return api.sendMessage(hateReplies[Math.floor(Math.random() * hateReplies.length)], event.threadID, event.messageID);
        }

        if (body === "bore" || body === "বোর" || body === "বিরক্ত") {
            const boreReplies = [
                "Bore? Ami entertain kori na? 😔",
                "Bore hole amake propose korun, exciting hobe 😏",
                "বোর না হয়ে আমার সাথে গল্প করুন ✨",
                "Bore? Let's play a game! 😄",
                "বিরক্ত হলে ভালোবাসার কথা বলুন 😘"
            ];
            return api.sendMessage(boreReplies[Math.floor(Math.random() * boreReplies.length)], event.threadID, event.messageID);
        }

        // FUNNY/TAUNTING REPLIES
        if (body === "Nunu" || body === "পেনিস" || body === "sex" || body === "সেক্স" || body === "fuck") {
            const funnyReplies = [
                "Gali Dili Kare Tui? Baper Sathe Ablami koris?😮‍💨",
                "Sex education nite paren 😏",
                "পেনিস নিয়ে মাথা ঘামাবেন না, মুখে ঢুকিয়ে দিবো এখম 💋",
                "ভাগ কালো কুত্তা হালা 🌚",
                "বেশি সেক্স সেক্স করিস না ধরে সেক্স করে দিবো",
                "Fuck you ! 🫦"
            ];
            return api.sendMessage(funnyReplies[Math.floor(Math.random() * funnyReplies.length)], event.threadID, event.messageID);
        }

        // MORE WESTERN GALI
        if (body.includes("bitch") || body.includes("dhon") || body.includes("shit") || body.includes("dudh") || body.includes("bastard") || body.includes("motherfucker")) {
            const westernGaliReplies = [
                "Oho! English gali! 😏",
                "Bitch bolle ami meow meow kori 😺",
                "Asshole? Niche dekhen 😎",
                "Shit happens! Hehe 😅",
                "Damn right! 😜",
                "Bastard? At least I'm your bastard 😘",
                "Motherfucker? Tell your mother I said hi 😂"
            ];
            return api.sendMessage(westernGaliReplies[Math.floor(Math.random() * westernGaliReplies.length)], event.threadID, event.messageID);
        }

        // SLOT 1
        if (body === "Ghuma" || body === "Ghumma" || body.includes("ghuma")) {
        	const replies = ["Tui Ghuma Age! 😮‍💨","Nope! 🥱","Ghumabo na Tor ki!😒","Ghum dhore na go 😞💔","Ghum nai Cokhe 😩💔","Aso Eksatge Ghumai 💋🫦"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 2
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 3
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 4
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 5
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 6
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 7
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 8
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 9
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 10
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 11
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 12
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 13
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 14
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 15
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 16
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 17
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 18
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 19
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 20
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 21
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 22
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 23
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 24
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        // SLOT 25
        if (body === "keyword1" || body === "keyword2" || body.includes("keyword")) {
        	const replies = ["reply 1","reply 2","reply 3","reply 4","reply 5","reply 6"];
        return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // KIRRE / KI RE
        if (body === "kirre" || body === "ki re" || body === "kirre?" || body === "ki re?" || body === "kirre!" || body === "Kire" || body === "Kire?" || body === "Kirre?" || body === "Ki re?" || body === "Kirre!" || body === "Ki re!") {
            const replies = [
                "আসসালামু আলাইকুম 👀💗! কেমন আছো?😗",
                "Ki re bhai/bon? Kemon achis? 😊",
                "Bol 🙂",
                "আরে ভাই/আপু! কি খবর? 😄"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        if (originalBody === "কে রে" || originalBody === "কে রে?" || originalBody === "কিরে" || originalBody === "কি রে") {
            const replies = [
                "আসসালামু আলাইকুম 👀💗! কেমন আছো?😗",
                "বলো জান 💋 আসো চুম্মা দেই!🫦 ",
                "বেবি 💋! কেমন আছো? 💕",
                "আরে ভাই/আপু! কি খবর? 😄"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // KI KORO
        if (body === "ki koro" || body === "Ki koros" || body === "Ki korcho" || body === "Ki koris" || body === "Ki koro?" || body === "Ki korcho?") {
            const replies = [
                "Kichu na, tomar sathe kotha bolchi 😊..Tumi ki korcho?",
                "Tumay Dekhi 👀, tumi ki korcho? 💕",
                "Bose 🙂, Tummii?🫠",
                "Tomake miss kortesi, tumi ki koris? 🥺"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        if (originalBody === "কি করো" || originalBody === "কি করো?" || originalBody === "কি করছ" || originalBody === "কি করছো?" || originalBody === "কি করিস" || originalBody === "কি করিস?") {
            const replies = [
                "কিছু না, তোমার সাথে কথা বলছি 😊..তুমি কি করছো?",
                "তোমায় দেখি 🙈, তুমি কি করছো? ",
                "কিছু না গো!🥲, তুমি?",
                "তোমাকে মিস করছি, তুমি কি কর? 🥺"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // VALO ACHO
        if (body === "Valo Acho" || body === "Bhalo Acho" || body === "Valo Achis" || body === "Bhalo Achis" || body === "Valo Acho?" || body === "Bhalo Achis?") {
            const replies = [
                "Haa Alhamdulillah valo achi 😌💗, tumi ki valo acho?",
                "Valo achi baby 💕, tomar ki khobor?",
                "Alhamdulillah valo achi jaan 😘, tumi ki valo achis?",
                "Haa Alhamdulillah ami valo, tomar sathe kotha bolte bhalo lagche ✨"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        if (originalBody === "ভালো আছো" || originalBody === "ভাল আছ" || originalBody === "ভালো আছো?" || originalBody === "ভালো আছিস" || originalBody === "ভালো আছিস?") {
            const replies = [
                "হা আলহামদুলিল্লাহ 😌💗, তুমি ?",
                "ভালো আছি বেবি 💕, তোমার কি খবর?",
                "আলহামদুলিল্লাহ 😘, তুমি ?",
                "হা আলহামদুলিল্লাহ , তুমি?"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // KI KHOBOR
        if (body === "ki khobor" || body === "ki khbr" || body === "ki khobor?" || body === "Ki khobor?" || body === "Ki khobor" || body === "Ki Khobor" || body === "Ki khbr?") {
            const replies = [
                "Valo achi jaan 😊, Tomar ki khobor?",
                "Alhamdulillah 💗🫶🏻, Tumar?",
                "Alhamdulillah 😌💖 Tomake onek miss korchi 🥺",
                "Alhamdulillah 🤲🏻💗, Tomar ki khobor ? 👀"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }
        
        if (originalBody === "কি খবর" || originalBody === "খবর কি" || originalBody === "কি খবর?" || originalBody === "কি খবর বলো") {
            const replies = [
                "ভালো আছি জান 😊, তোমার কি খবর?",
                "আলহামদুলিল্লাহ 💖, তোমার?",
                "আলহামদুলিল্লাহ 💖🫶🏻, তোমাকে মিস করছি অনেক 🥺",
                "আলহামদুলিল্লাহ 😌💗, তোমার কি খবর বলো? 😘"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // MISS KORCHI
        if (body.includes("miss") && (body.includes("Miss you") || body.includes("Onek miss korchi tmy") || body.includes("Onek din por"))) {
            const replies = [
                "Ami o tomake miss korchi 😘💕",
                "Uff, ki shundor bolla! Ami o tomake miss korchi 🥺",
                "Really? 🥹 Ami o tomake onek miss korchi jaan 💗",
                "Thank you for missing me! Ami o tomake miss korchi ✨"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // BHAI/BON/VAI
        if (body === "bhai" || body === "bon" || body === "vai" || body === "dada" || body === "Mmh" || body === "Apu" || body === "Vaiya") {
            const replies = [
                "Hae. ki? 😊",
                "Bolo bhai/bolo bon 💕",
                "Ki bolte chao? ✨",
                "Hae, ki kotha? 😘",
                "Yes bhai/bon? Ki khobor? 🤗"
            ];
            return api.sendMessage(replies[Math.floor(Math.random() * replies.length)], event.threadID, event.messageID);
        }

        // LOVE/I LOVE YOU
        if (body.includes("love") || body === "i lab u" || body === "tomake bhalobashi" || body === "bhalobashi" || body === "I love you" || body === "I Love You" || body === "Love you" || body === "ভালোবাসি") {
            const loveReplies = [
                "Ami o tomake bhalobashi jaan 😘💕",
                "Uff, ki shundor bolla! Ami o tomake bhalobashi 🥺",
                "Really? 🥹 Ami o tomake onek bhalobashi 💗",
                "Thank you jaan 😊, ami o tomake bhalobashi ✨",
                "ওউউ! আমিও তোমাকে ভালোবাসি জানু 🥰",
                "ধন্যবাদ! আমিও তোমাকে অনেক ভালোবাসি 💖"
            ];
            return api.sendMessage(loveReplies[Math.floor(Math.random() * loveReplies.length)], event.threadID, event.messageID);
        }
        
        if (originalBody.includes("ভালোবাসি") || originalBody.includes("লাভ") || originalBody === "আই লাভ ইউ") {
            const loveReplies = [
                "আমিও তোমাকে ভালোবাসি জান 😘💕",
                "উফ, কি সুন্দর বললা! আমিও তোমাকে ভালোবাসি 🥺",
                "রিয়ালি? 🥹 আমিও তোমাকে অনেক ভালোবাসি 💗",
                "থ্যাংক ইউ জান 😊, আমিও তোমাকে ভালোবাসি ✨",
                "ওউউ! আমিও তোমাকে ভালোবাসি জানু 🥰",
                "ধন্যবাদ! আমিও তোমাকে অনেক ভালোবাসি 💖"
            ];
            return api.sendMessage(loveReplies[Math.floor(Math.random() * loveReplies.length)], event.threadID, event.messageID);
        }

        // HAHA/HEHE/LAUGH
        if (body === "😂😂" || body === "hehe" || body === "lol" || body === "😂" || body === "😆" || body === "🤣" || body === "😹" || body === "😹😹") {
            const laughReplies = [
                "Ki hashis? Amakeo Hashaio na 😂",
                "Hashteso keno? Ki hoiche? 😆",
                "Eto hashis keno jaan? 😄",
                "Hashteso Je Etoo Khusi Khusi kenn?🫣",
                "কি হাসছো? আমাকেও হাসাও না 🤣",
                "হাসছো কেনো? কি হয়েছে? 😄"
            ];
            return api.sendMessage(laughReplies[Math.floor(Math.random() * laughReplies.length)], event.threadID, event.messageID);
        }

        // HI/HELLO
        if (body === "hi" || body === "hello" || body === "hay" || body === "oye" || body === "হাই" || body === "Hi" || body === "Hlw" || body === "Hii" || body === "হ্যালো") {
            const hiReplies = [
                "Hello jaan 😊",
                "Hi baby 💕",
                "Hay, ki khobor? ✨",
                "Oye, kemon achis? 😘",
                "হাই প্রিয়! কেমন আছো? 🥰",
                "হ্যালো! কি খবর? 😄"
            ];
            return api.sendMessage(hiReplies[Math.floor(Math.random() * hiReplies.length)], event.threadID, event.messageID);
        }

        // BYE/TATA
        if (body === "bye" || body === "goodbye" || body === "tata" || body === "bbye" || body === "বিদায়" || body === "চলি") {
            const byeReplies = [
                "Bye bye jaan, take care 😘",
                "Tata, aabar dekha hobe 💕",
                "Bye, Allah Hafez ✨",
                "Chole jao? Thik ache, bye 😊",
                "বিদায়! আল্লাহ হাফেজ 🥰",
                "ঠিক আছে, আবার কথা হবে 💖"
            ];
            return api.sendMessage(byeReplies[Math.floor(Math.random() * byeReplies.length)], event.threadID, event.messageID);
        }

        // GOOD NIGHT
        if (body === "Good Night" || body === "shuva ratri" || body === "shubho ratri" || body === "ratri" || body === "good night") {
            const nightReplies = [
                "Good night jaan 😘💕 Sweet dreams!",
                "Shuva ratri 💖 Bhalo Theko 🥰",
                "Good night baby 💫 Sweet dreams!",
                "Shubho ratri 😴 Bhalo thakben ✨"
            ];
            return api.sendMessage(nightReplies[Math.floor(Math.random() * nightReplies.length)], event.threadID, event.messageID);
        }

        // GOOD MORNING
        if (body === "good morning" || body === "shuvo sakal" || body === "subho sakal" || body === "Good Morning") {
            const morningReplies = [
                "Good morning jaan 😘💕",
                "Shuvo sakal 💖 Bhalo theko 🥰",
                "Good morning baby 💫 Have a nice day!",
                "Subho sakal 😊 Bhalo thakben ✨"
            ];
            return api.sendMessage(morningReplies[Math.floor(Math.random() * morningReplies.length)], event.threadID, event.messageID);
        }

        // THANK YOU
        if (body === "thank you" || body === "thanks" || body === "thnx" || body === "ধন্যবাদ" || body === "tnx" || body === "Thanks" || body === "Thank You") {
            const thanksReplies = [
                "Welcome jaan 😘💕",
                "You're welcome! 💖",
                "Wall Come 🐸🫶🏻",
                "🫶🏻💖🎀",
                "Welcome Bbyy 💋 💫"
            ];
            return api.sendMessage(thanksReplies[Math.floor(Math.random() * thanksReplies.length)], event.threadID, event.messageID);
        }

        // SORRY
        if (body === "sorry" || body === "Sorry" || body === "Tolly" || body === "Khoma") {
            const sorryReplies = [
                "It's Okay Jaan 😘💕",
                "Accha Accha Maf Korlam 😊",
                "Thik ache, kichu hoi nai 🥰",
                "ঠিক আছে, কিছু হয়নি 😊",
                "No problem baby 💫"
            ];
            return api.sendMessage(sorryReplies[Math.floor(Math.random() * sorryReplies.length)], event.threadID, event.messageID);
        }

        // WHAT'S UP
        if (body === "what's up" || body === "Ki koris?" || body === "wassup" || body === "ki koris?" || body === "Ki Koro??" || body === "Ki koro" || body === "Kita Koro?" || body === "কি করিস") {
            const whatsUpReplies = [
                "imo.🌚",
                "Massenger. 🐸",
                "Tomar Sathe Kotha Boli. Tumi?",
                "এইতো বসে। তুমি?😗",
                "সুয়ে আছি গো 👀 তুমি?"
            ];
            return api.sendMessage(whatsUpReplies[Math.floor(Math.random() * whatsUpReplies.length)], event.threadID, event.messageID);
        }

        // ====================================
        // PREFIX WALA MESSAGE (LAST OPTION)
        // ====================================
        if (body.startsWith("baby") || 
            body.startsWith("bby") || 
            body.startsWith("bot") || 
            body.startsWith("jan") || 
            body.startsWith("babu") || 
            body.startsWith("janu") ||
            body.startsWith("jann") || 
            body.startsWith("oii") || 
            body.startsWith("noob") || 
            body.startsWith("Noob") || 
            body.startsWith("Jan") || 
            body.startsWith("Bby") || 
            body.startsWith("Baby") || 
            body.startsWith("Bot")) {
            
            const arr = body.replace(/^\S+\s*/, "");
            const randomReplies = ["😚", "Hae Shona 👀 Bolo, Tor ki khaya ar kono kaj nai?🥲", "Bolo jaan ki korte pari tmr jonno", "💋", "Hae jann 🥺💋!", "Bolo bby 👀", "Ki hoiche?😒", "Eto Daiko na go 😞", "Ere Keo Thama 🙏", "Wha Happen?🐸", "Uff!!! Dustu 🌚💋 ", "Eto Sundor Kore Dakle To Moreii jaboo!!😩", "Tuii Bot!😒🔪 Ami pro.😁", " Ay 1v1 Kori!🫦", "Eije Jann Aya Porchi 🫣", "Tumi Eto Sundor Kennnoo?😭🎀", "🫦", "Ektu Busy Achi Jann 🥺 1 Minute Pore Knock Deii?👀", "Ayy Hayy Pokie je 👀🎀", "Ghurte Niye Jaba Ettuu?🥺", "Age Ekta Gan Sunao! Nahole Kotha Bolbo na! 🥺😩", "Tumar profile + Tumi Masha Allah 😩🫶🏻💗", "Tomar Preme Pore Gelam 🫣 Ekhon Amay Uthabe ke?🥺", "🌚👍🏻", "Assalamualaikum 💗🫶🏻", "Ki Khobor Tomar?👀", "Din Kal Kemon Jayy?😗", "Jahh Dustu. 🫣💗", "Eije Eikhane 😗", "Bolen 😌", "Tmr Preme Habudubu Khacchi Baccaoo Amay 😭", "i lab u 💋", "Jiii 😌", "Rifat Sir! Ekhoni Single Ache.👀! Meye hoile gf Hoye jao. Ar chele hoile gf khuje daoo 🐸🫶🏻 ", "Sunlam Tmr Naki Biya 🌚 Daowat to Dila na?😞", "Tomar Jonne Buk Vora Valobasha 🤌🏻💗", "Valobaste Sikho Prio.😗🫶🏻", "Kya Hua?🫣", "Ekta Thappor deii?🫣😁", "Line Marte Ascho Abar?😒", "Tumi Naki Luccami Koro?", "Aso Kori 🫣! Mane Golpo", "Bol. 🌚", "Ar Kotobar Dakba Suntechi Tooo 😐", "ভালোবাসা আর না। কষ্ট আমি পাইছি তুমি না! 🥰🙏💔", "ভালোবাসা লাগলে রিফাত এর ইনবক্সে যা!😾🔪", "যার জামাই নাই তার জন্য রিফাত আছে! 😗 ", "Ei Je Sundori Ki Hoiche bolo. 🙈💖", "আহা আবার কি হইলো!😑", "Bolo Etkkhon Tomr Opekkhay Chilam.🥹", "Jann Dakte Kosto Hoyy?😾", "Tumi Amar Shuna Pakhii 🫣💖", "Dhong!😒", "Amay Dako Naki?🙂", "Tomar Preme Ondho Hoye Gechi. 💔🙏", "oi na please 💔🙏", "", "", "", "", "", ""];
            
            if (!arr) {
                await api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
                    if (!info) message.reply("info obj not found");
                    global.GoatBot.onReply.set(info.messageID, {
                        commandName: this.config.name,
                        type: "reply",
                        messageID: info.messageID,
                        author: event.senderID
                    });
                }, event.messageID);
                return;
            }
            
            const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
            await api.sendMessage(a, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    commandName: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    author: event.senderID,
                    a
                });
            }, event.messageID);
        }
        
    } catch (err) {
        return api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
    }
};
