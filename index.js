const express = require('express');
const fs = require('fs');

const app = express();
const HEADER_SIZE = 20*4;

app.get('/header', (req, res) => {
    fs.open(__dirname + '/atoms.apov', 'r', (err, fd) => {
        if(!err) {
            const buffer = Buffer.allocUnsafe(HEADER_SIZE);
            fs.read(fd, buffer, 0, HEADER_SIZE, 0, (err, count, header) => {
                if(!err && count == HEADER_SIZE) {
                    res.end(header, 'binary');
                } else res.status(500).end();
            });
        } else res.status(500).end();
    });
});

app.get('/frame/:offset/:size', (req, res) => {
    const offset = +req.params.offset + HEADER_SIZE;
    const size = Math.pow(+req.params.size, 2)*4;
    const stream = fs.createReadStream(__dirname + '/atoms.apov', {
        highWaterMark: size,
        encoding: 'binary',
        start: offset
    }).on('data', (chunk) => {
        stream.destroy();
        res.end(chunk, 'binary');
    }).on('erro', () => {
        res.status(500).end();
    });
});

app.listen(5000);
