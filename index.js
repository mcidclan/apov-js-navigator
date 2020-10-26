const express = require('express');
const fs = require('fs');

const app = express();

app.get('/frame/:offset/:size', (req, res) => {
    const offset = +req.params.offset;
    const size = Math.pow(+req.params.size, 2)*4;
    const stream = fs.createReadStream(__dirname + '/atoms-done.bin', {
        highWaterMark: size,        
        encoding: 'binary',
        start: offset
    });
    
    stream.on("data", (chunk) => {
        stream.destroy();
        res.end(chunk, 'binary');
    }); 
});

app.listen(5000);
