const Discord = require('discord.js');
const logger = require('winston');

const request = require('request');
const cheerio = require('cheerio');

const google = require('google')

google.resultsPerPage = 1


//ATH: Bot verður að vera með Role sem leyfir Manage Messages

const bot = new Discord.Client({
    messageCacheMaxSize: 10
});

logger.remove(logger.transports.Console);
logger.add(logger.transports.Console, {
    colorize: true
});
logger.level = 'debug';

const auth = require('./auth.json');
const botID = '413821115920547840';

let userList = [];

/*bot.on('Ready', async = () => {
    logger.info('Connected');
    logger.info(`Logged in as:  ${bot.user.username}, ${bot.user.tag}, id: ${bot.user.id}`);
        await logger.info('shit')
};
});*/

onReady = () => {
    logger.info('Connected');
    logger.info(`Logged in as:  ${bot.user.username}, ${bot.user.tag}, id: ${bot.user.id}`);
};

// docs: https://discord.js.org/#/docsr/main/stable/class/Message
onMessage = (message) => {

    const holdPrefix = ['h', 'hodl', 'hold']
    const msg = message.content;    
    const authorTag = `<@${message.author.id}>`

    if (msg.substring(0,1) == '$' || msg.substring(0,1) == '!'){

        // will accept '$cmd' and '$ cmd'
        const c = msg.toLowerCase().substring(1).split(' ');
        const command = c[0] === '' ? c[1] : c[0];

        console.log
        switch(command) {
            case 't':
                message.channel.send(`HODLERS: <@99236910844616404>`)
                    .then(m => m.pin())
                    .catch(console.error);
                break;
            case 'h':
            case 'hodl':
            case 'hold':
                doHodl(message);
                //console.log([...message.channel.fetchPinnedMessages().array()])
                break;

            case 's':
            case 'sodl':
            case 'sold':
                doSodl(message);
                break;
            case 'i':
            case 'addinfo':
                doInfo(message, 'BTC')
                break;
            case 'e':
            case 'editinfo':
                //finna eftir prefix, 
                //brjóta upp skilaboð, 
                //velja slot 0,1 eða 2 -  official, twitter eða reddit til að breyta
            case 'u':
                getAllUser(userList)
                break;

        }

    }
}

function doHodl(message){

    const authorTag = `<@${message.author.id}>`

    message.channel.fetchPinnedMessages()
        .then(p => { p.map( msg => {
            if (msg.author.bot && msg.content.startsWith('HODLERS:') ) {

                if (msg.content.indexOf(authorTag)>0) {
                    message.reply(`þú ert nú þegar á listanum`)
                } 
                else {
                    message.reply(`eg bætti þér í listann`)
                    msg.edit(`${msg.content}, ${authorTag}`)
                }                            
            }
            else {
                message.channel.send(`HODLERS: ${authorTag} `)
                     .then(m => m.pin())
            }
        })
    })
}

function doSodl(message){
    const authorTag = `<@${message.author.id}>`

    message.channel.fetchPinnedMessages()
        .then(p => { p.map( msg => {
            if (msg.author.bot && msg.content.startsWith('HODLERS:') ) {

                let names = [];
                msg.content.split(' ')
                    .filter( (e, i) => i > 0 )
                    .forEach((m) => names.push(m.replace(',','')
                ));
                if (msg.content.indexOf(authorTag)>0){
                    msg.edit(`HODLERS: ${names.filter(m => m !== authorTag)}`)
                    message.reply(`ég tók þig af listanum`)
                }
                else {
                    message.reply(`þú ert ekki á listanum`)
                }           
            }
        })
    })
}

function doInfo(message, coin){

    // Ákveða PREFIX
    //1:finna nafnið á channelinu
    //2:leita að reddit, bæta í infoMessage
    //3:leita að twitter, bæta í
    //4:-||-     offical website, bæta í
    //5: send and pin
    let channelName = message.channel.name;

    let url = 'https://api.coinmarketcap.com/v1/ticker?limit=0'
    request(url, function(error, response, body){
        let info = JSON.parse(body);

        let c = info.find(i => i.symbol === coin.toUpperCase())
       
        googleSearch(c.name)

    })

    function googleSearch(coinName){

        let infoMessage = `INFO: ${coinName} - `

        google(`official website ${coinName} cryptocurrency`, function (err, res) {
            if (res.links[0].link != null)
            {
                infoMessage += `${res.links[0].link} - `
            }
            google(`reddit ${coinName} cryptocurrency`, function (err, res) {
                if (res.links[0].link != null)
                {
                    infoMessage += `${res.links[0].link} - `
                }
                google(`twitter ${coinName} cryptocurrency`, function (err, res) {
                    if (res.links[0].link != null)
                    {
                        infoMessage += `${res.links[0].link}`
    
                    }
                    message.channel.send(infoMessage)
                        .then(m => m.pin())
                        .catch(console.error);
                })
            })
        }) 
    }
}

function getAllUser(userList) {

    bot.users.map(u =>
        userList.push( {
            id: u.id,
            name: u.username,
            syntax: `${u.username}#${u.discriminator}`,
            tag: `<@${u.id}>`
        })
    )
    return userList
}


bot.on('ready', onReady);
bot.on('message', onMessage);
bot.login(auth.token);