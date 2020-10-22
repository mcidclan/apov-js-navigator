const app = require("express")();

app.get('/hello', (req, res) => {
    return res.send("Hello from APoV server!");
});

app.listen(5000);
