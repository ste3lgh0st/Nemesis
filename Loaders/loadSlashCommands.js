const { REST, Routes } = require("discord.js");

module.exports = async (bot) => {
    const commands = [];

    bot.commands.forEach((command) => {
        if (command.data && typeof command.data.toJSON === "function") {
            commands.push(command.data.toJSON());
            return;
        }

        const commandName = command.name || command.data?.name;
        const commandDescription = command.description || command.data?.description || "Aucune description fournie";

        if (!commandName) return;

        const slashCommand = {
            name: commandName,
            description: commandDescription,
            type: 1,
            options: Array.isArray(command.options) ? command.options.map(option => ({
                ...option,
                type: typeof option.type === "number" ? option.type : option.type
            })) : [],
            default_member_permissions: command.permission ? command.permission.toString() : null,
            dm_permission: command.dm ?? false
        };

        commands.push(slashCommand);
    });

    let token = bot.token || process.env.TOKEN;
    if (!token) {
        try {
            const config = require("../config");
            token = config.token;
        } catch {
        }
    }

    if (!token) {
        console.error("❌ Impossible de charger les Slash Commands : Aucun token Discord trouvé !");
        return;
    }

    if (!bot.user?.id) {
        console.error("❌ Impossible de charger les Slash Commands : ID du bot introuvable.");
        return;
    }

    const rest = new REST({ version: "10" }).setToken(token);

    try {
        console.log(`🔄 Enregistrement de ${commands.length} commande(s) Slash en cours...`);
        
        await rest.put(
            Routes.applicationCommands(bot.user.id),
            { body: commands }
        );

        console.log("✅ Toutes les commandes Slash ont été enregistrées avec succès auprès de l'API Discord !");
    } catch (error) {
        console.error("❌ Erreur lors de l'enregistrement des commandes Slash :", error);
    }
};