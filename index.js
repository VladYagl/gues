const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const PORT = process.env.PORT || 5000;
const fs = require('fs');

const {Client} = require('pg');
const client = new Client({
    connectionString: process.env.DATABASE_URL || 'postgres://wurydivxytdloi:bcc7345dc28646a41419262e6003945845be33d075176091707e2ca1f43f1bcc@ec2-54-75-225-52.eu-west-1.compute.amazonaws.com:5432/d6suingcq5plal',
    ssl: {
        rejectUnauthorized: false
    }
});
client.connect();


// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     client.end();
// });

// const values = fs.readFileSync('videos.txt', {encoding:'utf8', flag:'r'}).split('\n').map(el => `('${el}')`);
// client.query('INSERT INTO videos(id) VALUES ' + values, (err, res) => {
//     console.log(err, res);
//     if (err) throw err;
//     client.end();
// });

express()
    .use(bodyParser.json())
    .use(express.static(path.join(__dirname, 'public')))
    .set('views', path.join(__dirname, 'views'))
    .set('view engine', 'ejs')
    .get('/', (req, res) => res.render('pages/index'))
    .get('/edit', (req, res) => res.render('pages/edit'))

    .get('/lists', (req, res) => {
        fs.readdir('.', (err, files) => {
            let lists = files.filter(el => /\.txt$/.test(el)).map(el => el.replace(/\.[^/.]+$/, ""))
            // console.log(lists);
            res.send(lists)
        });
    })

    .get('/videos', (req, res) => {
        // const filename = req.query.list + '.txt';
        // if (!fs.existsSync(filename)) {
        //     fs.writeFileSync(filename, "")
        // }
        //
        // res.send(fs.readFileSync(filename));

        const name = req.query.list;
        client.query(`SELECT id from ${name}`, (err, r) => {
            if (err) throw err;
            console.log(r.rows.map(el => el.id));
            res.send(r.rows.map(el => el.id));
        });
    })
    .post('/videos', (req, fullRes) => {
        // const filename = req.query.list + '.txt';
        // fs.writeFileSync(filename, req.body);
        // console.log("Videos updated");
        // res.sendStatus(200)

        const name = req.query.list;
        client.query(`CREATE TABLE IF NOT EXISTS ${name} (id VARCHAR(12) UNIQUE)`, (err, res) => {
            const values = req.map(el => `('${el}')`);
            client.query(`INSERT INTO ${name}(id) VALUES ` + values, (err, res) => {
                console.log(err, res);
                if (err) throw err;
                fullRes.sendStatus(200)
            });
        })
    })

    .listen(PORT, () => console.log(`Listening on ${PORT}`));