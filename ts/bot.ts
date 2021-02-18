import { Client, Message } from 'discord.js';
import { config } from 'dotenv';
import { render } from './commands/render';

console.log('Importing environment variables...');
config();

console.log('Starting up the Discord API client...');
const client = new Client();

client
    .once('ready', () => {
        console.log('Initialisation complete.');
        console.log(`Accepting requests. Default prefix is ${process.env.PREFIX}`);
    })
    .on('message', (message: Message): void => {
        // Ignore a message if it's from a bot
        if (message.author.bot)
            return;

        const content = message.content.trim();
        // Ignore a message if it doesn't start with a prefix
        if (!content.startsWith(`${process.env.PREFIX}render`))
            return;

        render(message)
            .catch(reason => console.error(reason));
    });

client.login(process.env.TOKEN)
    .catch(reason => console.log(reason));
