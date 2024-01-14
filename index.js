const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
var chalk = require('chalk');
const moment = require('moment');
moment.locale('tr');
const tokens = fs.readFileSync(path.resolve(__dirname, 'tokens.txt'), 'utf-8').split(/\r?\n/);

// endpoints
const DISCORD_API_BASE_URL = 'https://discord.com/api/v10';
const USER_GUILD_ENDPOINT = DISCORD_API_BASE_URL + '/users/@me/guilds';

// files
const OUTPUT_DIR = `./output/${moment().format('YYYY-MM-DD-HH-mm')}`;
const LOCKED_TOKENS_FILE = path.join(__dirname, OUTPUT_DIR, 'Locked.txt');
const INVALID_TOKENS_FILE = path.join(__dirname, OUTPUT_DIR, 'Invalid.txt');
const UNKNOW_ERROR_FILE = path.join(__dirname, OUTPUT_DIR, 'Unknow Error.txt');
const INVALID_FORMAT_FILE = path.join(__dirname, OUTPUT_DIR, 'Invalid Format.txt');
const GUILD_SİZE_100_FILE = path.join(__dirname, OUTPUT_DIR, 'Server Limit Is Full.txt');
const GUILD_SİZE_1_FILE = path.join(__dirname, OUTPUT_DIR, 'Available on less than 100 servers.txt');
const GUİLDS_DIR = path.join(__dirname, OUTPUT_DIR, 'Guilds');
if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

// colors
const gray = chalk.hex('#68786e');
const orange = chalk.hex('#ff8c00');
const time = chalk.hex('#05cbf7');
const purple = chalk.hex('#8106bf');

// counters
let count = 0;

(async () => {
    console.log(
        chalk.green(`>> You have successfully logged in!\n\n`) +
        chalk.cyan(`>> Welcome ${chalk.yellow("EndyWasHere$")}\n`) +
        chalk.cyan(`>> This script was made by endy ${chalk.white("https://discord.gg/dctoken\n")}`) +
        chalk.cyan(`>> Loaded ${chalk.yellow(tokens.length)} Tokens\n`)
    );

    for (const token of tokens) {
        count++;
        let tokenData = token.split(':');
        if (tokenData.length == 1) {
            await checkGuilds(tokenData[0], token);
        } else if (tokenData.length == 3) {
            await checkGuilds(tokenData[2], token);
        } else {
            console.log(`${time(`[${moment().format('LTS')}]`)} - [${purple(chalk.underline(tokenData[0].slice(0, 26)))}] | ${chalk.red(`[Invalid Format]`)} - ${gray(`[${count}/${tokens.length}]`)}`);
            fs.appendFileSync(INVALID_FORMAT_FILE, token + '\n');
        }
    }
    console.log(chalk.green(`>> Finished Get ${tokens.length} tokens in ${(process.uptime().toFixed(2))} seconds!`));
})();

async function checkGuilds(tokenData, token) {
    const response = await fetch(USER_GUILD_ENDPOINT, { headers: { Authorization: tokenData }, method: "GET" }).catch(err => {
        console.log(chalk.red(`>> Error: An error occured while fetching data from the API. Please try again later.`));
        fs.appendFileSync('log.txt', `[ERROR] -> [${moment().format('LTS')}] Error: An error occured while fetching data from the API. Please try again later.\n`);
        process.exit(0);
    });
    const userData = await response?.json();
    if (!userData) return;
    if (userData.code === 40002) {
        console.log(`${time(`[${moment().format('LTS')}]`)} - [${purple(chalk.underline(tokenData.slice(0, 26)))}] | ${chalk.yellow('Locked Token')} - ${gray(`[${count}/${tokens.length}]`)}`);
        fs.appendFileSync(LOCKED_TOKENS_FILE, `${token}\n`);
    } else if (userData.code === 0) {
        console.log(`${time(`[${moment().format('LTS')}]`)} - [${purple(chalk.underline(tokenData.slice(0, 26)))}] | ${chalk.red('Invalid Token')} - ${gray(`[${count}/${tokens.length}]`)}`);
        fs.appendFileSync(INVALID_TOKENS_FILE, `${token}\n`);
    } else if (userData.length >= 0) {
        console.log(`${time(`[${moment().format('LTS')}]`)} - [${purple(chalk.underline(tokenData.slice(0, 26)))}] | Get ${chalk.green(userData.length)} Guild(s) - ${gray(`[${count}/${tokens.length}]`)}`);
        fs.mkdirSync(GUİLDS_DIR, { recursive: true });
        fs.appendFileSync(path.join(GUİLDS_DIR, userData.length + '.txt'), `${token}\n`);
        if (userData.length == 100) {
            fs.appendFileSync(GUILD_SİZE_100_FILE, `${token}\n`);
        } else fs.appendFileSync(GUILD_SİZE_1_FILE, `${token}\n`);
    } else {
        console.log(`${time(`[${moment().format('LTS')}]`)} - [${purple(chalk.underline(tokenData.slice(0, 26)))}] | ${orange('Unknow Error')} - ${gray(`[${count}/${tokens.length}]`)}`);
        fs.appendFileSync(UNKNOW_ERROR_FILE, `${token}\n`);
    }
}