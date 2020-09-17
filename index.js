const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 5000;
const fs = require('fs');

const { Client } = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

client.query('CREATE TABLE IF NOT EXISTS videos (id VARCHAR(10), list VARCHAR(50));', (err, res) => {
    console.log('SHIT', err, res);
    if (err) throw err;
    for (let row of res.rows) {
        console.log(JSON.stringify(row));
    }
    client.end();
});

express()
    .use(bodyParser.text())
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/edit', (req, res) => res.render('pages/edit'))

    .get('/lists', (req, res) => {
        fs.readdir('.', (err, files) => {
            let lists = files.filter(el => /\.txt$/.test(el)).map(el => el.replace(/\.[^/.]+$/, ""))
            console.log(lists);
            res.send(lists)
        });
    })

    .get('/videos', (req, res) => {
        const filename = req.query.list + '.txt';
        if (!fs.existsSync(filename)) {
            fs.writeFileSync(filename, "")
        }

        res.send(fs.readFileSync(filename));
    })
    .post('/videos', (req, res) => {
        const filename = req.query.list + '.txt';
        fs.writeFileSync(filename, req.body);
        console.log("Videos updated");
        res.sendStatus(200)
    })

    .listen(PORT, () => console.log(`Listening on ${ PORT }`));