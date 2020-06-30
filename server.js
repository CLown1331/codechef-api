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
    if (result.rating == null) {
        res.status(204);
    } else {
        res.status(200);
    }
    res.send(result);
});

async function getUserInfo (username) {
    try {
        console.log(`fetching rating for ${username}`);
        const response = await fetch(`https://www.codechef.com/users/${username}`);
        const userPage = await response.text();
        const $ = cheerio.load(userPage);
        const rating = $('.rating-number').first().text() || null;
        const times = $('.time');
        const lastParticipation = times.first().text() || null;
        let lastParticipationTimeStamp = null;
        let lastParticipationDate = null;
        times.each(function(i, elem) {
            let date = new Date($(this).text().replace('(', '').replace(')', ''));
            if (date.getTime() !== date.getTime()) {
                return;
            }
            console.log(date, lastParticipationDate);
            if (lastParticipationDate === null || lastParticipationDate < date) {
                lastParticipationDate = date;
            }
            lastParticipationTimeStamp = lastParticipationDate.getTime() / 1000;
        });
        console.log(rating, !!rating);
        console.log(lastParticipation, !!lastParticipation);
        console.log('---\n');
        return {
            username,
            rating,
            lastParticipationDate,
            lastParticipationTimeStamp,
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

