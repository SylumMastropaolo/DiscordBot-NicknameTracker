
// Connect to DB
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/paging-bot', { useNewUrlParser: true })
var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"))
db.once("open", function(callback) {
    console.log("DB Connection Succeeded")
})

// Import the nickname model
var Nickname = require("./models/nickname")

// Import the discord.js module.
const Discord = require('discord.js')

// Create an instance of Discord used to control the bot.
const bot = new Discord.Client();

const config = require('./config')

// Bot's token, found on the dashboard. I should later generate a new token and remove this from code.
const token = config.DISCORD_BOT_TOKEN

// Gets called when our bot is successfully logge din and connected
bot.on('ready', () => {
    console.log('Hello World');
})

// Event to listen to messages sent to the server where the bot is located
bot.on('message', message => {
    // So the bot doesn't reply to itself and ignores messages not containing @ symbols
    if (message.author.bot || message.content.indexOf('@') === -1) return;

    if (message.content.indexOf('@') !== -1) {
        var new_nickname = new Nickname({
            user: '',
            nickname: '',
            channel: message.channel.id
        })
        for( var i = 0; i < message.content.length; i ++) {
            if(message.content.charAt(i) === '<' && message.content.charAt(i+1) === '@') {
                for( var j = i; message.content.charAt(j) !== ' ' && j < message.content.length; j++) {
                    new_nickname.user += message.content.charAt(j)
                }
            }
            if(message.content.charAt(i) === '@' && message.content.charAt(i-1) !== '<') {
                for( var k = i; message.content.charAt(k) !== ' ' && k < message.content.length; k++) {
                    new_nickname.nickname += message.content.charAt(k)
                }
            }
        }
        if (new_nickname.user !== '' && new_nickname.nickname !== ''){
            Nickname.findOne({nickname: new_nickname.nickname, channel: message.channel.id}, 'nickname user', function (error, response) {
                if (error) {
                    message.channel.send("There was an error, check my console for more info")
                    console.log(error)
                }
                if(response !== null) {
                    Nickname.findOneAndUpdate({nickname: new_nickname.nickname, channel: message.channel.id}, { user: new_nickname.user }, function (error) {
                        if (error) {
                            message.channel.send("There was an error, check my console for more info")
                            console.log(error)
                        } else {
                            message.channel.send("The old " + response.nickname + " was " + response.user + " but now it's " + new_nickname.user )
                        }
                    })
                } else {
                    new_nickname.save(function (error) {
                        if (error) {
                            message.channel.send("There was an error, check my console for more info")
                            console.log(error)
                        }
                        message.channel.send("I agree, " + new_nickname.user + " is a " + new_nickname.nickname)
                    })
                }
            })
        } else if (new_nickname.user === '' && new_nickname.nickname !== '') {
            Nickname.findOne({nickname: new_nickname.nickname, channel: message.channel.id}, function (error, response) {
                if (error) {
                    message.channel.send("There was an error, check my console for more info")
                    console.log(error)
                }
                if(response !== null) {
                    message.channel.send(response.nickname + "? You must be talking about " + response.user)
                }
            })
        }
    }
})

bot.login(token)
