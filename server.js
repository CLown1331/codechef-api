"use strict"
const express = require("express");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const _ = require('lodash');

const port = process.env.PORT || 8080

const app = express();

app.get('/ping', (req, res) => {
    res.send('pong');
});

app.get('/rating/:userName', async (req, res) => {
    console.log(`fetching`);
    const userName = req.params.userName;
    if (!userName) {
        res.send();
    }
    const result = await getUserInfo(userName);
    console.log(result);
    res.send(result);
});

async function getUserInfo (username) {
    try {
        console.log(`fetching rating for ${username}`);
        const response = await fetch(`https://www.codechef.com/users/${username}`);
        const userPage = await response.text();
        const $ = cheerio.load(userPage);
        const rating = $('.rating-number').first().text() || null;
        let lastParticipation = $('.time').first().text() || null;
        if (lastParticipation) {
            lastParticipation = new Date(lastParticipation.replace('(', '').replace(')', '')).getTime() / 1000;
        }
        console.log(rating, !!rating);
        console.log(lastParticipation, !!lastParticipation);
        console.log('---\n');
        return {
            username,
            rating,
            lastParticipation,
        }
    } catch (err) {
        console.error(err);
        throw err;
    }
}
// (async function() {
//     const result = await getUserInfo('CLown133123');
//     console.log(result);
// }());
app.listen(port, () => console.log(`Example app listening on port ${port}!`))

