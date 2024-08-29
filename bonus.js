const axios = require("axios");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const apiId = 23563414;
const apiHash = "b0d6b98b363839b22acb1fd056ab2a07";
const sessionKey = "1BQANOTEuMTA4LjU2LjE2MgG7Avu8Srkuxhm7TZVSbKAqO9EOO5MS8kuEOZiHPNco8bWX2o5iyT1NizsvwH6429qO4fEALIlaQobcGXIJXGctL3KnlpJQwRkcWQl81Ric6lhFoDnFDsWCqfsLpBfyFr8opOHneOsAoWr28LumIf9SfkpK+ZdTEDwKqk4/Di89N5Och5Kt+hErSX7L8lN3M8ZkK/y18loAk1CCB2nkGv7U6TBSCY39d32rPkJYXzXrhyR5oMWFgP8Ty03LYq5Y2zbK7LiCYFz7CLtfJM7DN6K3QFtnYid8ekHI7uEVrgs+G17ghu2J80VvYXoMX8K3EQtyIxTNrdmVCPPGPwmDzMKWVQ==";

const apiUrl = "https://colorwiz.cyou/mana/receive_red_packet";

const session = new StringSession(sessionKey); 
const client = new TelegramClient(session, apiId, apiHash, {});


const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

const sendRedeemRequest = async (mobile, packetCode) => {
    // console.log("inside send")
  try {
    const response = await axios.post(apiUrl, { mobile, packet_code: packetCode }, {
      headers: { 
        "Content-Type": "application/json",
        "Connection": "keep-alive"
      },
      timeout: 30000, // Set a timeout to ensure requests don't hang indefinitely
    });
    // console.log(response.data)
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
    await client.connect();
    
    let lastMessageIds = { "@colorwiz_bonus": null, "@testinggroupbonus": null };

    while (true) {
        try {
            // Check messages from both channels
            for (const channel of ["@colorwiz_bonus", "@testinggroupbonus"]) {
                const messages = await client.getMessages(channel, { limit: 1 });

                if (messages.length > 0) {
                    const latestMessage = messages[0];

                    if (lastMessageIds[channel] === null || latestMessage.id > lastMessageIds[channel]) {
                        lastMessageIds[channel] = latestMessage.id;

                        const redeemCode = extractRedeemCode(latestMessage.message);

                        if (redeemCode) {
                            try {
                                const data = await sendRedeemRequest("+918685862889", redeemCode);
                                await handleRedeemResponse(client, data, "Bhai Ankush");
                            } catch (error) {
                                console.error(`Error handling redeem response: ${error.message}`);
                            }
                        }
                    }
                }
            }

            await delay(1000); // Adjust the delay as needed

        } catch (err) {
            console.error("Error fetching messages: ", err);
            // Handle errors or rate limit here
            await delay(5000); // Backoff strategy
        }
    }
})();




//for both group
// (async () => {
//     await client.connect();
    
//     let lastMessageIds = { "@colorwiz_bonus": null, "@testinggroupbonus": null };

//     while (true) {
//         try {
//             // Check messages from both channels
//             for (const channel of ["@colorwiz_bonus", "@testinggroupbonus"]) {
//                 const messages = await client.getMessages(channel, { limit: 1 });

//                 if (messages.length > 0) {
//                     const latestMessage = messages[0];

//                     if (lastMessageIds[channel] === null || latestMessage.id > lastMessageIds[channel]) {
//                         lastMessageIds[channel] = latestMessage.id;
//                     console.log("Latest message: ", latestMessage.message);

//                     const redeemCode = extractRedeemCode(latestMessage.message);

//                     if (redeemCode) {
//                         // console.log(redeemCode)
//                         try {
//                         const data = await sendRedeemRequest("+918685862889", redeemCode);
//                         await handleRedeemResponse(client, data, "Bhai Ankush");
//                         } catch (error) {
//                         console.error(`Error handling redeem response: ${error.message}`);
//                         }
//                     }
//                 }
//             }
//             await delay(900); 
//         } catch (err) {
//             console.error("Error fetching messages: ", err);
//             // Handle errors or rate limit here
//             await delay(1000); // Backoff strategy
//         }
//     }
// })();
