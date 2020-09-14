const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 5000;
const fs = require('fs');

express()
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/videos', (req, res) => {
        res.send(fs.readFileSync('videos.txt'));
    })
    .get('/', (req, res) => res.render('pages/index'))
    .listen(PORT, () => console.log(`Listening on ${ PORT }`));