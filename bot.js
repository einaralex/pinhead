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

onReady = () => {
    logger.info('Connected');
    logger.info(`Logged in as:  ${bot.user.username}, ${bot.user.tag}, id: ${bot.user.id}`);
};

// docs: https://discord.js.org/#/docsr/main/stable/class/Message
onMessage = (message) => {

    const msg = message.content;    
    const authorTag = `<@${message.author.id}>`

    if (msg.substring(0,1) == '$' || msg.substring(0,1) == '!'){

        // will accept '$cmd' and '$ cmd'
        const c = msg.toLowerCase().substring(1).split(' ');

        const command = c[0] === '' ? c[1] : c[0];
        const flag = c[0] === '' ? c[2] : c[1]; 
        const args = c[0] === '' ? c[3] : c[2]; 


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
                break;
            case 's':
            case 'sodl':
            case 'sold':
                doSodl(message);
                break;
            case 'i':
            case 'addinfo':
                doInfo(message);
                break;
            case 'e':
            case 'editinfo':
                editInfo(message, flag, args)
                break;
            case 'u':
                getAllUser(userList)
                break;
            case 'help':
                getHelp(message);
                break;

        }
    }
}
function getHelp(message){

    message.channel.send(` $ | !  h | hodl | hold   - To add user to pin`)
    message.channel.send(` $ | !  s | sodl | sold   - To remove user from pin`)
    message.channel.send(` $ | !  i | addinfo       - Adds info to pin by channel name (cryptocurrency abbreviation)`)
    message.channel.send(` $ | !  e | editinfo n|name / w|website / r|reddit / t|twitter {name/link} - Edits info in pin i.e: $editinfo name shitcoin`)
}

function doHodl(message){

    const authorTag = `<@${message.author.id}>`
    let foundPinByBot;

    message.channel.fetchPinnedMessages()
        .then(p => {

            foundPinByBot = !!p.find(i=> i.author.id === botID && i.content.startsWith('HODLERS:'))

                p.map( msg => {
                    if (msg.author.bot && foundPinByBot) {
                        if (msg.content.indexOf(authorTag)>0) {
                            message.reply(`þú ert nú þegar á listanum`)
                        } 
                        else {
                            message.reply(`eg bætti þér í listann`)
                            msg.edit(`${msg.content}, ${authorTag}`)
                        }                            
                    }
                    else if (!foundPinByBot && p.size == 0) {
                        message.channel.send(`HODLERS: ${authorTag} `)
                        .then(m => m.pin())
                         
                    }                     
                })
            if (!foundPinByBot && p.size == 0){
                message.channel.send(`HODLERS: ${authorTag} `)
                        .then(m => m.pin())
            }
            
    })
}

function doSodl(message){
    const authorTag = `<@${message.author.id}>`

    message.channel.fetchPinnedMessages()
        .then(p => { !!p && p.map( msg => {
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

function editInfo(message, flag, args){
    let coin = message.channel.name

    if (!flag || !args){
        console.log('Ekki valid input')
    }
    switch(flag){
        case 'n':
        case 'name':
            flag = 0
        case 'w':
        case 'website':
            flag = 1
        case 'r':
        case 'reddit':
            flag = 2
        case 't':
        case 'twitter':
            flag = 3
    }
    message.channel.fetchPinnedMessages()
        .then(p => { p.map( msg => {
            if (msg.author.bot && msg.content.startsWith('INFO:') ) {

                let info = msg.content.split(' - ');
                info[flag] = args
                msg.edit(info)                     
            }
        })
    })
}

function doInfo(message){

    let coin = message.channel.name
    let url = 'https://api.coinmarketcap.com/v1/ticker?limit=0'
    request(url, function(error, response, body){
        let info = JSON.parse(body);

        let c = info.find(i => i.symbol === coin.toUpperCase())
        
        if(c){
            googleSearch(c.name)
        }
        else {
            message.channel.send('Finn ekki þetta coin á CMC')
        }

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