var Discord = require('discord.io');
var logger = require('winston');
var auth = require('./auth.json');
// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';
// Initialize Discord Bot
var bot = new Discord.Client({
    token: auth.token,
    autorun: true
});

var botID = '413821115920547840';

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});
bot.on('message', function (user, userID, channelID, message, evt) {
    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `!`

    //logger.info("user:" + user + " userID:" + userID + " channelID:" + channelID + " message:" + message)
    if (message.substring(0, 1) == '!') {

        // after skipping the inital ! mark, message it split up to arrays by whitespace
        var args = message.substring(1).split(' ');

        var cmd = args[0];

        var testString = "HODLERS: jonni,einaralex,sveittur,halldor";

        var pinnedPrefixForHolders = 'HODLERS'

        switch (cmd) {
            
            case 't':
                sendMessages(channelID, testString, function(err, res) {           
                    pinMessage(res.channel_id, res.id)    
                });

                break;

            case 'hold':

                getPinnedMessages(channelID, function (err, res) {
                    
                    var foundPinByBot = false;
                    var alreadyInPin = false;

                        //iterate through all pinned messages 
                        for (var i = 0; i < res.length; i++) {
                            
                            //check if the bot created the message
                            if (res[i].author.id == botID && isStringInMessage(pinnedPrefixForHolders, res[i].content)) {
                                foundPinByBot = true;
                                //check if the user being pinned is already in the message
                                if (res[i].content.indexOf(user) == -1) {

                                    
                                    var editedMessage = res[i].content + "," + user
                                    var msg = "Ég bætti þér í listann"
                                    
                                    //add the user to the message
                                    editMessage(channelID, res[i].id, editMessage);

                                    //inform the user
                                    sendMessages(channelID, msg);

                                }
                                else {
                                    alreadyInPin = true;
                                }
                            }
                        }
                        if (!foundPinByBot) {
                            var msg = pinnedPrefixForHolders + ": " + user;

                            sendMessages(channelID, msg, function(err, res) {
                                pinMessage(res.channel_id, res.id)  

                            })
                        }
                        if (alreadyInPin && foundPinByBot) {
                            var msg = "Þú ert nú þegar í pinned messages"
                            sendMessages(channelID, msg);
                        }
                    }
                );
                break;

                case 'sold':

                getPinnedMessages(channelID, function (err, res) {
                    
                    var foundPinByBot = false;
                    var alreadyInPin = false;

                        //iterate through all pinned messages 
                        for (var i = 0; i < res.length; i++) {

                            var messageContent = res[i].content;
                            
                            //check if the bot created the message
                            if (res[i].author.id == botID && isStringInMessage(pinnedPrefixForHolders, res[i].content)) {
                                foundPinByBot = true;

                                var indexOfUser = messageContent.indexOf(user);
                                //check if the user being pinned is already in the message
                                if (indexOfUser !== -1) {

                                    //Split the message so [0] = 'HODLERS:', [1] = name1,name2,..
                                    var contentArr  = messageContent.split(' ')

                                    // split the namelist by comma
                                    var nameArr = contentArr[1].split(',');
                                    var index = nameArr.indexOf(user);

                                    if (index !== -1) nameArr.splice(index, 1);
                                    
                                    var newMessage = contentArr[0] + " " + nameArr.join(',')
                                    var msg = "Ég tók þig af listanum"
                                    
                                    //add the user to the message
                                    editMessage(channelID, res[i].id, newMessage);

                                    //inform the user
                                    sendMessages(channelID, msg);
                                }
                                else {
                                    alreadyInPin = true;
                                }
                            }
                        }
                    
                        if (alreadyInPin && foundPinByBot) {
                            var msg = "Þú ert ekki í pinned messages"
                        }
                    }
                );
                break;

                case '!!help':
                    sendMessages(channelID, "Commands: !hold !sold");
                break;
        }
    }

});

function sendMessages(ID, message) {

    var callback = arguments[2];

    bot.sendMessage({
        to: ID,
        message: message
    }, function (err, res) {
        if (err) return shittyErrorHandler(err.statusMessage, err.StatusCode)
        if (typeof (callback) === 'function') callback(err, res);
    }
    );
}

function editMessage(channelId, messageId, msg) {

    var callback = arguments[3];

    bot.editMessage({
        channelID: channelId,
        messageID: messageId,
        message: msg
    }, function (err, res) {
        if (err) return shittyErrorHandler(err.statusMessage, err.StatusCode)
        if (typeof (callback) === 'function') callback(err, res);
    }
    );
}

function pinMessage(channelId, messageId) {
    
    var callback = arguments[2];

    //ATH: Bot verður að vera með Role sem leyfir Manage Messages

    bot.pinMessage({
        channelID: channelId,
        messageID: messageId
    }, function (err, res) {
        if (err) return shittyErrorHandler(err.statusMessage, err.StatusCode)
        if (typeof (callback) === 'function') callback(err, res);
    });
}

function getPinnedMessages(channelId) {
    var callback = arguments[1];

    bot.getPinnedMessages({
        channelID: channelId
    }, function (err, res) {
        if (err) return shittyErrorHandler(err.statusMessage, err.StatusCode)
        if (typeof (callback) === 'function') callback(err, res);
    });
}

function isStringInMessage (str, message) {
    if (message.indexOf(str) == -1){
        return false
    }
    else return true
}

function shittyErrorHandler(message, statusCode) {
    logger.error("ERROR no." + statusCode + ": " + message )
}