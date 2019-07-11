const app = require('express')();
const http = require('http').Server(app);
const expressHandlebars = require('express-handlebars');
const path = require('path');

// View Engine
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', expressHandlebars({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

app.use('/', require('./routes/index'));

http.listen(5000, () => console.log('Server started listening on port 5000!'));