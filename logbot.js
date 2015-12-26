/*
NPM requirements:
discord.js
moment

KEEP IN MIND of a few important things:
-Usernames CAN change. The logs won't show that specifically, unless modified to do so.
-Server / Channels names CAN change. This means files may / will unexpectedly append in the wrong ones if they've been switching around a lot.
 */

var Discord = require("discord.js");
var fs = require("fs");
var moment = require("moment");
var util = require("util");

//configs are for username/password. You can reaplace it with a JSON stating that.
var config = require("./config.json");
var bot = new Discord.Client();

bot.on("message", (message) => {
  processsmessage(message);
});

processsmessage = (msg) => {
  //Parse message content into a readable line format
  var time = moment().format("YYYY-MM-DD HH:mm:ss");
  var channelName = msg.channel.name;
  var server = msg.channel.server.name;
  var user = msg.author.username;
  var message = msg.content !== "" ? msg.content : msg.attachments[0].url;

  //replace if server or channel name has an invalid character / escape character
  server = server.replace(/([.*+?^=!:${}()|\[\]\/\\\"<>])/g, "");
  channelName = channelName.replace(/([.*+?^=!:${}()|\[\]\/\\\"<>])/g, "");

  //replace numeric ID with actual name
  var userid = message.match(/<@([0-9]{15,25})>/);
  if (userid) {
    var username = bot.users.get("id", userid[1]);
    message = message.replace(/<@[0-9]{15,25}>/g, username.username);
  }

  //finish and concat
  var messageContent = `\n${time} ${user}: ${message}`;
  var directory = __dirname + '/logs/' + server + " #" + channelName + ".log";

  //create directory if not found
  fs.access(__dirname + '/logs/', fs.F_OK, (err) => {
    if (err) {
      console.log("Directory /logs/ not found, creating directory")
      fs.mkdir(__dirname + '/logs/', {
        flags: 'wx'
      }, (err) => {
        console.log("Error: Cannot make directory /logs/")
      });
    }
  })

  //create access file if not found
  fs.access(directory, fs.F_OK, (err) => {
    if (err) {
      fs.writeFile(directory, messageContent.replace("\n", ""), {
        flags: 'wx'
      }, (err) => {
        if (err) throw err;
      });
      console.log("created file");
      return;
    } else {
      fs.appendFile(directory, messageContent, (err) => {
        if (err) {
          console.log("Error: could not append to file");
        } else {
        }
      });
    }
  });
};

bot.login(config.auth.email, config.auth.pass);
