const express = require('express');
const exphbs  = require('express-handlebars');
const path = require('path')
require('dotenv').load();
const app = express();
app.set('views', path.join(__dirname, '/../views'));
app.set('view engine', '.hbs');
app.engine('.hbs', exphbs({
    helpers:[],
    layoutDir:path.join(__dirname, '/../views/layouts'),
    partialsDir:[path.join(__dirname, '/../views/partials')],
    extname:'.hbs'
}));


module.exports = (client) => {
    app.listen(process.env.PORT||8888)
    console.log(`[server] Loaded on port ${process.env.PORT||8888}`)
    app.use('/rehost',require('./web_rehost').router)
    app.use('/quotes',require('./quote').router)
    app.get('/',(req,res) => {
        if(Math.random() > .50) {
            return res.send("<h1>Hi</h1><audio autoplay loop><source src='https://cdn.jackz.me/drkleiner_why.mp3'></audio>")
        }else{
            return res.send("<h1>Hi</h1><audio autoplay loop><source src='https://cdn.jackz.me/gman_why.mp3'></audio>")
        }
        
    })
    app.get('*', function(req, res){
        res.status(404).send('<h1>404</h1><p>Page was not found</p>');
    });
}
