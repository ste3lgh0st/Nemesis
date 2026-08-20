/**
 * Génère un identifiant unique aléatoire de 10 caractères avec un préfixe optionnel.
 * @param {string} [prefix=""]
 * @returns {string}
 */
module.exports = (prefix = "") => {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let id = "";
    
    for (let i = 0; i < 10; i++) {
        id += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return prefix ? `${prefix}${id}` : id;
};