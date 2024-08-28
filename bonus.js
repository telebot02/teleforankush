const axios = require("axios");
const { TelegramClient } = require("telegram");
const { StringSession } = require("telegram/sessions");

const apiId = 23563414;
const apiHash = "b0d6b98b363839b22acb1fd056ab2a07";
const sessionKey = "1BQANOTEuMTA4LjU2LjE2MgG7u99WWjPm0yR5vW9xwfDuJNz0cycmIqzLRUyHnTYY1JihY1yOiVVPBsoa+ZHsMmavB1vFc7wjEB6JrMcLn0sExe+Y3e7MfH2Bc6G061lRpvIpvFs5H1X/u7H+akCMvdnEKFNOP6u7V/e8QHMJXVyxlPb/7TBKX3PaYcNxhiygp/OVPIz3AM8Hz7KJ+wMxwiP4OXCTOMouFtYs7N2DA8KvgJMxGI8yVP3JSGkhOuQE3Qu6JPHnDobvEynjWdlcITi5SKRDacuygjGxFh4P8baVT01EXGACnzoCSyeLsdNjNIAeQInt4cp3WEbYrrrGOOJ9vvW/H9ZvdQ6cK4ZJJ/15Vw==";

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

            await delay(900); // Adjust the delay as needed

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
