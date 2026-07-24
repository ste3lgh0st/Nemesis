const Discord = require("discord.js");
const intents = new Discord.IntentsBitField(3276799)
const bot = new Discord.Client({intents})
const loadCommands = require("./Loaders/loadCommands.js")
const loadEvents = require("./Loaders/loadEvents.js")
const config = require("./config")

bot.commands = new Discord.Collection()
bot.color = "#0309e2";
bot.function = {
    createId: require("./Fonctions/createId"),
    }


bot.login(config.token)
loadCommands(bot)
loadEvents(bot)