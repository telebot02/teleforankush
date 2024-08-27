const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");
const { NewMessage } = require("telegram/events");
const axios = require("axios");

const testingChatId = "1493065360";
const bonusChatId = "2247051543";
const apiId = 28596369;
const apiHash = "f50cfe3b10da015b2c2aa0ad31414a55";
const sessionKey = "1BQANOTEuMTA4LjU2LjE2MgG7Lh+OYzvB3h6d58gAZWlsY9Vxr8G3NbqpkCXpsdrpSqJ3lXmDbK8aFiVVNNhBfsbceijMSKBDH3vUs04iwBVj03aJ1wA8i4kgWHWa1m0JeSoh6QBydndM3z5JLjGdXwspXfdM65L6KOsMrSE7IAiC5pltXmuZe6LtlAHzb9peQ7DTPd3YBLPumNZ2esqwGEL9OkfiwwiX48112Y2pBBO1jcXvlhElrqAK5lN9O/R2RBe1LhkU5Lxdt19zrtMzEd6IU//i0ko7DKEWHcMIqJWEp7kszx5pLKk+UERpzdQhRB8o1TV2JzvZ8rikDbh4kWZO5i69/Dyfj7h1tuK4EbPlfw==";
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
          const data = await sendRedeemRequest("+917015957516", redeemCode);
          await handleRedeemResponse(client, data, "Ankush");
        } catch (error) {
          console.error(`Error handling redeem response: ${error.message}`);
        }
      }
    }
  }, new NewMessage({}));

  console.log("Bot running...");
})();