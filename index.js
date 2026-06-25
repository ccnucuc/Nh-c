const { Client, GatewayIntentBits } = require('discord.js');
const { LavalinkManager } = require('lavalink-client');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

const lavalink = new LavalinkManager({
    nodes: [{
        id: "GlaceYT",
        host: "ge-02.vortexa.cloud",
        port: 11050,
        password: "glace",
        secure: false
    }],
    sendToShard: (guildId, payload) => client.guilds.cache.get(guildId)?.shard.send(payload),
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('>')) return;
    const args = message.content.slice(1).split(/ +/);
    const command = args.shift().toLowerCase();
    
    // Xử lý các lệnh
    try {
        if (command === 'play') {
            if (!message.member.voice.channel) return message.reply("Bạn cần vào phòng voice!");
            const player = lavalink.createPlayer({
                guildId: message.guild.id,
                voiceChannelId: message.member.voice.channel.id,
                textChannelId: message.channel.id,
            });
            await player.connect();
            const res = await player.search({ query: args.join(' '), source: "ytsearch" }, message.author);
            player.queue.add(res.tracks[0]);
            if (!player.playing) await player.play();
            message.reply(`🎵 Đang phát: ${res.tracks[0].title}`);
        }

        if (command === 'pause') {
            lavalink.getPlayer(message.guild.id)?.pause(true);
            message.reply("⏸ Đã tạm dừng.");
        }

        if (command === 'stop') {
            lavalink.getPlayer(message.guild.id)?.destroy();
            message.reply("⏹ Đã dừng phát.");
        }

        if (command === '24/7') {
            const player = lavalink.getPlayer(message.guild.id);
            if (player) {
                const is247 = !player.get('247');
                player.set('247', is247);
                message.reply(`🔄 Chế độ 24/7: ${is247 ? 'BẬT' : 'TẮT'}`);
            }
        }
    } catch (e) {
        console.error(e);
        message.reply("Có lỗi xảy ra, kiểm tra lại link nhạc hoặc server Lavalink!");
    }
});

client.on('raw', (d) => lavalink.sendRawData(d));
client.login(process.env.DISCORD_TOKEN);
