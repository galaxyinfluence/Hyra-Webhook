const fetch = require('node-fetch');

const HYRA_TOKEN = process.env.HYRA_TOKEN;
const WORKSPACE_ID = process.env.WORKSPACE_ID;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

module.exports = async (req, res) => {
  const options = {
    method: 'GET',
    headers: { Authorization: `Bearer ${HYRA_TOKEN}` }
  };

  try {
    const response = await fetch(`https://api.hyra.io/activity/sessions/${WORKSPACE_ID}/upcoming`, options);
    const sessions = await response.json();

    const embeds = [];

    for (const session of sessions) {
      if (session.host?.exists) {
        embeds.push({
          title: session.schedule.name,
          description: `:emoji_9:  A shift is being hosted at our branch at <t:${Math.floor(new Date(session.start).getTime() / 1000)}:t>. Please begin joining 10 minutes early so we can begin shortly afterwards.\n\nHost: <@${session.host.username}>\nCo Host: <@${session.co_host?.username || 'N/A'}>\n\nWe cannot wait to see you!\nThe link to the main game will be posted when it is time to join.`,
          url: session.schedule.game_link,
          color: 0x5865F2,
          footer: { text: `Schedule ID: ${session.schedule._id}` }
        });
      }
    }

    if (embeds.length > 0) {
      await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ embeds })
      });
    }

    res.status(200).json({ message: 'Webhook(s) sent', count: embeds.length });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
};
