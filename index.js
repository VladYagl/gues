const express = require('express');
// const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 5000;
const fs = require('fs');

express()
    // .use(bodyParser.text())
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    // .get('/edit', (req, res) => res.render('pages/edit'))

    // .get('/videos', (req, res) => {
    //     res.send(fs.readFileSync('videos.txt'));
    // })
    // .post('/videos', (req, res) => {
    //     fs.writeFileSync('videos.txt', req.body);
    //     console.log("Videos updated");
    //     res.sendStatus(200)
    // })

    .listen(PORT, () => console.log(`Listening on ${ PORT }`));