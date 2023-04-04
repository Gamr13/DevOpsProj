const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
    .setName('ban') //Command name
    .setDescription('Permanently remove someone from your server.') //Command description
    .addUserOption(option => option.setName('target').setDescription('Who do I ban?').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Why are they being banned?'))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),   //Only show command if user has ban permissions. [Check #1]

    async execute (interaction, client) {

        const banUser = interaction.options.getUser('target');
        const banMember = await interaction.guild.members.fetch(banUser.id);
        const channel = interaction.channel;

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) return await interaction.reply({ content: "Error: You don't have permission to use this command.", ephemeral: false });   //[check #2]
        if (!banMember) return await interaction.reply({ content: 'Error: User is not in the server.', ephemeral: false});   //Error check, if member is not in server, bot won't crash.
        if (!banMember.kickable) return await interaction.reply({ content: "Error: This person is above you in roles.", ephemeral: false});  //[Check #3]

        let reason = interaction.options.getString('reason');
        if (!reason) reason = "No reason given.";

        const dmEmbed = new EmbedBuilder()
        .setColor("DarkOrange")
        .addFields(
            { name: ':white_check_mark:', value: `You've been permanently removed from: **${interaction.guild.name}**`, inline: false },
            { name: 'Reason:', value: `${reason}`, inline: false },
        )

        const embed = new EmbedBuilder()
        .setColor("DarkOrange")
        .setDescription(`:white_check_mark:  ${banUser.tag} has been **banned** `)
        .addFields(
                { name: 'Reason:', value: `${reason}`, inline: false },
            )

        await banMember.send({ embeds: [dmEmbed] }).catch(err => {
            return;
        });

        await banMember.ban({ reason: reason }).catch(err => {
            interaction.reply({ content: `There was an error.`, ephemeral: true});  //Error checking.
        });

        await interaction.reply({ embeds: [embed] });

    }
}