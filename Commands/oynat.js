const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const emojiler = require('../Settings/emojiler.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('oynat')
        .setDescription('Şarkıyı başlatır.')
        .addStringOption(option =>
            option.setName('şarkı')
                .setDescription('Şarkı adı veya bağlantı gir.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('platform')
                .setDescription('Şarkı arama platformunu seç.')
                .addChoices(
                    { name: 'Otomatik', value: 'auto' },
                    { name: 'YouTube', value: 'youtube' },
                    { name: 'SoundCloud', value: 'soundcloud' },
                    { name: 'Spotify', value: 'spotify' }
                )
                .setRequired(false)),

    async execute(interaction) {
        const query = interaction.options.getString('şarkı');
        const platform = interaction.options.getString('platform') || 'auto';
        const voiceChannel = interaction.member.voice.channel;

        if (!voiceChannel) {
            return interaction.reply({
                content: `${emojiler.dikkat} **Önce bir ses kanalına katıl.**`,
                flags: 64
            });
        }

        const player = interaction.client.player;
let queue = player.nodes.get(interaction.guild.id);

if (queue?.connection) {
    const botChannel = queue.connection.joinConfig.channelId;

    if (botChannel !== voiceChannel.id) {
        return interaction.reply({
            content: `${emojiler.dikkat} **Bot şu anda başka bir ses kanalında kullanılıyor.**`,
            flags: 64
        });
    }

    if (queue.metadata?.userId && queue.metadata.userId !== interaction.user.id) {
        return interaction.reply({
            content: `${emojiler.dikkat} **Bu müzik oturumu <@${queue.metadata.userId}> tarafından başlatıldı, sadece o kişi yeni şarkı ekleyebilir.**`,
            flags: 64
        });
    }
}

if (!queue) {
    queue = await player.nodes.create(interaction.guild, {
        metadata: { channel: interaction.channel, userId: interaction.user.id }, 
        leaveOnEmpty: false,
        leaveOnEnd: false,
        leaveOnStop: true,
        selfDeaf: true
    });
}

        try {
            if (!queue.connection) await queue.connect(voiceChannel);
        } catch (err) {
            queue.delete();
            return interaction.reply(`${emojiler.dikkat} **Ses kanalına bağlanılamadı.**`);
        }

        await interaction.deferReply();

        const searchResult = await player.search(query, { requestedBy: interaction.user, searchEngine: platform });

        if (!searchResult || searchResult.tracks.length === 0) {
            return interaction.followUp(`${emojiler.dikkat} **Şarkı veya playlist bulunamadı.**`);
        }

        const isPlaylist = searchResult.playlist && searchResult.tracks.length > 1;

        if (isPlaylist) {
            searchResult.tracks.forEach(track => queue.addTrack(track));
            if (!queue.isPlaying()) await queue.node.play();

            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle('Playlist Çalıyor')
                .setDescription(`**${searchResult.playlist.title}** içindeki **${searchResult.tracks.length} şarkı** kuyruğa eklendi.`)
                .setThumbnail(searchResult.playlist.thumbnail || null);

            return interaction.followUp({
                content: `${emojiler.tik} Playlist kuyruğa **eklendi**.`,
                embeds: [embed],
                components: [getControlButtons()]
            });
        }

        const topTracks = searchResult.tracks.slice(0, 10);
        const options = topTracks.map((track, i) => ({
            label: track.title.slice(0, 100),
            description: `${track.source?.toUpperCase() || 'Bilinmiyor'} • ${track.author} • ${track.duration}`,
            value: i.toString()
        }));

        const menu = new StringSelectMenuBuilder()
            .setCustomId('select_track')
            .setPlaceholder('Şarkı seç')
            .addOptions(options);

        const row = new ActionRowBuilder().addComponents(menu);

        await interaction.followUp({
            content: `${emojiler.buyutec} Arama sonuçları bulundu, aşağıdan seçebilirsin:`,
            components: [row]
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.customId === 'select_track' && i.user.id === interaction.user.id,
            time: 15_000,
            max: 1
        });

        collector.on('collect', async i => {
            const selectedIndex = parseInt(i.values[0], 10);
            const selectedTrack = topTracks[selectedIndex];

            queue.addTrack(selectedTrack);
            if (!queue.isPlaying()) await queue.node.play(queue.tracks[0]);

            const embed = new EmbedBuilder()
                .setColor('#2F3136')
                .setTitle(`${selectedTrack.source.toUpperCase()}`)
                .setDescription(`**[${selectedTrack.title}](${selectedTrack.url})**`)
                .addFields(
                    { name: 'Yükleyen', value: selectedTrack.author || 'Bilinmiyor.', inline: true },
                    { name: 'Süre', value: selectedTrack.duration || 'Bilinmiyor.', inline: true },
                    { name: 'Açıklama', value: selectedTrack.description || 'Yok.', inline: false },
                    { name: 'Dinlenme Sayısı', value: selectedTrack.views?.toLocaleString() || 'Bilinmiyor.', inline: false },
                    { name: 'Playlist', value: selectedTrack.playlist?.title || 'Herhangi bir playliste ait değil.', inline: false }
                )
                .setThumbnail(selectedTrack.thumbnail || null)
                .setImage(selectedTrack.artwork || null);

            await i.update({
                content: `${emojiler.tik} Şarkı kuyruğa **eklendi**`,
                embeds: [embed],
                components: [getControlButtons()]
            });
        });

        collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.followUp({
                    content: `${emojiler.dikkat} **Şarkı seçilmediği için menü zamanaşımına uğradı.**`,
                    flags: 64
                });
            }
        });
    }
};

function getControlButtons() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('music_pause')
            .setLabel('⏸️ Durdur')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('music_resume')
            .setLabel('▶️ Devam Ettir')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('music_skip')
            .setLabel('⏭️ Şarkıyı Geç')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('music_stop')
            .setLabel('⏹️ Bitir')
            .setStyle(ButtonStyle.Danger)
    );
}
