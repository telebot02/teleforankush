const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const axios = require("axios");

const testingChatId = "1493065360";
const bonusChatId = "2247051543";
const apiId = 23563414;
const apiHash = "b0d6b98b363839b22acb1fd056ab2a07";
const sessionKey = "1BQANOTEuMTA4LjU2LjE2MgG7u99WWjPm0yR5vW9xwfDuJNz0cycmIqzLRUyHnTYY1JihY1yOiVVPBsoa+ZHsMmavB1vFc7wjEB6JrMcLn0sExe+Y3e7MfH2Bc6G061lRpvIpvFs5H1X/u7H+akCMvdnEKFNOP6u7V/e8QHMJXVyxlPb/7TBKX3PaYcNxhiygp/OVPIz3AM8Hz7KJ+wMxwiP4OXCTOMouFtYs7N2DA8KvgJMxGI8yVP3JSGkhOuQE3Qu6JPHnDobvEynjWdlcITi5SKRDacuygjGxFh4P8baVT01EXGACnzoCSyeLsdNjNIAeQInt4cp3WEbYrrrGOOJ9vvW/H9ZvdQ6cK4ZJJ/15Vw==";
const stringSession = new StringSession(sessionKey);
const apiUrl = "https://colorwiz.cyou/mana/receive_red_packet";

const sendRedeemRequest = async (mobile, packetCode) => {
  try {
    const response = await axios.post(apiUrl, { mobile, packet_code: packetCode }, {
      headers: { 
        "Content-Type": "application/json",
        "Connection": "keep-alive"
      },
      timeout: 30000, // Set a timeout to ensure requests don't hang indefinitely
    });
    return response.data;
  } catch (error) {
    console.error(`Error sending POST request: ${error.message}`);
  }
};

const handleRedeemResponse = async (client, data, username) => {
  let responseMessage;
  if (data.msg) {
    responseMessage = `Not your luck ${username}: ${data.msg}`;
  } else if (data.price) {
    responseMessage = `Hurry ${username} WON: ${data.price}`;
  } else {
    responseMessage = "Response not received properly";
  }
  console.log(responseMessage);
  await client.sendMessage("me", { message: responseMessage });
};

const extractRedeemCode = (text) => {
  const codeMatch = text.match(/gift\?c=([A-Za-z0-9]{24})/);
  return codeMatch ? codeMatch[1] : null;
};

(async () => {
  console.log("Starting bot...");
  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
    useWSS: false,
    autoReconnect: true,
    floodSleepThreshold: 120,
    baseDC: 2,
    requestTimeout: 43200000,
  });

  await client.start();
  console.log(`Listening for messages in channels: ${testingChatId}, ${bonusChatId}`);

  client.addEventHandler(async (event) => {
    const message = event.message;
    const channelId = message.peerId.channelId.toString();

    if (message && (channelId === testingChatId || channelId === bonusChatId)) {
      const redeemCode = extractRedeemCode(message.message);

      if (redeemCode) {
        try {
          const data = await sendRedeemRequest("+918685862889", redeemCode);
          await handleRedeemResponse(client, data, "Bhai Ankush");
        } catch (error) {
          console.error(`Error handling redeem response: ${error.message}`);
        }
      }
    }
  }, new NewMessage({}));

  console.log("Bot running...");
})();
