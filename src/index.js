const TelegramBot = require('node-telegram-bot-api');
require('dotenv').config();
const request = require('request');
const fs = require('fs');
const path = require('path');
const Jimp = require('jimp');

require('dotenv').config();

const express = require('express');
const app = express();
const port = process.env.PORT; // Change this to your desired port number

// Define a route
app.get('/', (req, res) => {
    res.send('Hello, Express!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});


var flag = 0 ;
const token = process.env.TOKEN;
const bot = new TelegramBot(token, {polling: true});

function strFunction(userName, id,msgId) {

  bot.sendMessage(id, "Hello! 👋👋 @" + userName + "\nHow are you? \nuse \/QRgen for QR code generation",{reply_to_message_id:msgId});

}

async function botSentQr(chatId,msgId) {
  try {
    // Read the image file
    const imageBuffer = fs.readFileSync('src/images/image.png'); // Replace with the actual image path

    // Send the image
    const response = await bot.sendPhoto(chatId, imageBuffer , { caption: 'Check out your qr code now' },{reply_to_message_id:msgId});
    console.log('Image sent');
    flag=0
  } catch (error) {
    console.log('Error sending image' + error);
  }
}

function fileUpload(base64Data,chatId,msgId) {
  const buffer = Buffer.from(base64Data, 'base64');

  // Load the image using Jimp
  Jimp.read(buffer)
    .then(image => {
      // Save the image as PNG
      const outputFilePath = path.join(__dirname, 'images', 'image.png'); // Change the output folder and file name as needed

      // Create the output directory if it doesn't exist
      if (!fs.existsSync(path.dirname(outputFilePath))) {
        fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
      }

      // Save the image
      image.write(outputFilePath, () => {
        console.log('Image saved as', outputFilePath);
        botSentQr(chatId,msgId)
      });
    })
    .catch(error => {
      console.error('Error:', error);
    });
}

function qrGenerator(data,chatId,msgId){
  var fmt = 'png'
  request.get({

    url: 'https://api.api-ninjas.com/v1/qrcode?data=' + data + '&format=' + fmt,
    headers: {
      'X-Api-Key': '2s5TUHYfey6DgdUGqaoH3Q==MK94RPX3wN5GBXpH'
    },
  }, function (error, response, body) {
    if (error) return console.error('Request failed:', error);
    else if (response.statusCode != 200) return console.error('Error:', response.statusCode, body.toString('utf8'));
    else {
      console.log("generated")
      fileUpload(body,chatId,msgId)
    }
  });
}

bot.on('message', (msg,match) => {

  userName = msg.chat.first_name;
  chatId = msg.chat.id;
  messageId = msg.message_id;


  if (msg.text== "/start"){
      strFunction(userName,chatId,messageId)
  }
  else if (msg.text== "/QRgen"){
    bot.sendMessage(chatId,"Pleace send me the content of the QR code",{ reply_to_message_id:messageId})
    flag = 1
  }else if (flag==1){
    var data = msg.text
    qrGenerator(data,chatId,messageId)
  }else{
      bot.sendMessage(msg.chat.id,"❌❌❌❌❌❌❌❌\nPlease only use this \/QRgen",{ reply_to_message_id:messageId} )
  }
})
// Read the JSON file
// fs.readFile('src/response.json', 'utf8', (err, data) => {
//   if (err) {
//     console.error('Error reading file:', err);
//     return;
//   }

//   try {
//     const jsonData = JSON.parse(data);
//     console.log('Imported data:', jsonData[0].Name);
//   } catch (parseError) {
//     console.error('Error parsing JSON:', parseError);
//   }
// });