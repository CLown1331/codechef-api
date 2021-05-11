"use strict"
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require("express");
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const _ = require('lodash');
const NodeCache = require( "node-cache" );
const cache = new NodeCache({ stdTTL: process.env.CACHE_TTL || 360, checkperiod: process.env.CACHE_CHECK || 600 });

console.log('cache ttl:', process.env.CACHE_TTL || 360);
console.log('cache check:', process.env.CACHE_CHECK || 600);

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
    const cachedValue = cache.get(userName);
    console.log('cachedValue: ', cachedValue);
    const result = cachedValue === undefined ? await getUserInfo(userName) : cachedValue;
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
        const result = {
            username,
            rating,
            lastParticipationDate,
            lastParticipationTimeStamp,
        };
        cache.set(username, result);
        return result;
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

