const { REST, Routes } = require("discord.js");

module.exports = async (bot) => {
    let commands = [];

    bot.commands.forEach((command) => {
        let slashCommand = {
            name: command.name,
            description: command.description,
            type: 1,
            options: command.options ? command.options.map(option => ({
                ...option,
                type: typeof option.type === "number" ? option.type : option.type
            })) : [],
            default_member_permissions: command.permission ? command.permission.toString() : null,
            dm_permission: command.dm ?? false
        };

        commands.push(slashCommand);
    });

    const rest = new REST({ version: "10" }).setToken(bot.token || require("../config").token);

    try {
        console.log("Enregistrement des commandes Slash en cours...");
        await rest.put(
            Routes.applicationCommands(bot.user.id),
            { body: commands }
        );
        console.log("Toutes les commandes Slash ont été enregistrées avec succès !");
    } catch (error) {
        console.error(error);
    }
};