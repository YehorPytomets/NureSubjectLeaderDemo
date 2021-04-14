import * as functions from "firebase-functions";
import {Telegraf} from "telegraf";

const bot = new Telegraf(functions.config().telegram.token, {
    telegram: {
        webhookReply: true,
    },
})

// error handling
bot.catch(async (err, ctx) => {
    functions.logger.error('[Bot] Error', err)
    await ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
    return Promise.resolve();
})

// initialize the commands
bot.command('/start', (ctx) => {
    ctx.reply('Hello! Send any message and I will copy it.');
});

// copy every message and send to the user
bot.on('message', (ctx) => {
    ctx.telegram.copyMessage(ctx.chat.id, ctx.message.chat.id, ctx.message.message_id);
});

// handle all telegram updates with HTTPs trigger
exports.echoBot = functions.https.onRequest(async (request, response) => {
    functions.logger.log('Incoming message', request.body);
    await bot.handleUpdate(request.body, response)
    response.sendStatus(200);
    return Promise.resolve();
})
