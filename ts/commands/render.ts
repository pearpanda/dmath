import { renderer } from "../renderer";
import {Message, MessageAttachment} from "discord.js";

export async function render(message: Message): Promise<void> {
    const formula = parse(message);
    const image = await renderer.render(formula);
    await message.reply(new MessageAttachment(image, 'formula.png'));
}

function parse(message: Message): string {
    const content = message.content.trim();

    // Remove the prefix and 'render' from the message
    return content.substr(process.env.PREFIX.length + 'render'.length).trim();
}
