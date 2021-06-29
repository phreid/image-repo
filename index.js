const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const Image = require('./models/image');
const User = require('./models/user');

mongoose.connect('mongodb://localhost:27017/image-repo', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));
db.once('open', () => {
    console.log('Connected to database');
});

const app = express();

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(session({
    secret: 'test-secret',
    saveUninitialized: true,
    resave: true
}));

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.userId = req.session.userId;
    next();
});

const requireLogin = (req, res, next) => {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/login');
    }
}

const filterOtherImages = (images, userId) => {
    return images.filter(image => ! image.author._id.equals(userId));
}

const filterUserImages = (images, userId) => {
    return images.filter(image => image.author._id.equals(userId));
}

app.get('/', async (req, res) => {
    let images = await Image.find({}).populate('author', 'username');
    images = filterOtherImages(images, req.session.userId);
    res.render('images/market', {images});
})

app.get('/images', async (req, res) => {
    let images = await Image.find({}).populate('author', 'username');
    images = filterOtherImages(images, req.session.userId);
    res.render('images/market', {images});
});

app.get('/images/new', (req, res) => {
    if (req.session.userId) {
        res.render('images/new');
    } else {
        res.render('users/login');
    }
});

app.post('/images', async (req, res) => {
    const image = new Image(req.body.image);
    await image.save();
    res.redirect(`/images/${image._id}`);
});

app.get('/images/myimages', requireLogin, async (req, res) => {
    const {id} = req.params;
    let images = await Image.find({}).populate('author', 'username');
    images = filterUserImages(images, req.session.userId);
    res.render(`images/myimages`, {images});
})

app.get('/images/:id', async (req, res) => {
    const {id} = req.params;
    const image = await Image.findById(id).populate('author', 'username');
    res.render('images/show', {image});
});

app.get('/images/:id/edit', async (req, res) => {
    const {id} = req.params;
    const image = await Image.findById(id).populate('author', 'username');
    res.render('images/edit', {image});
});

app.patch('/images/:id/buy', requireLogin, async (req, res) => {
    const {id} = req.params;
    await Image.findByIdAndUpdate(id, {quantity: req.body.quantity});
    res.redirect('back');
})

app.put('/images/:id', async (req, res) => {
    const {id} = req.params;
    const image = await Image.findByIdAndUpdate(id, {
        ... req.body.image, 
        author: req.session.userId
    });
    res.redirect('/images/myimages');
});

app.delete('/images/:id', async (req, res) => {
    const {id} = req.params;
    await Image.findByIdAndDelete(id);
    res.redirect('/images/myimages');
});

app.get('/register', (req, res) => {
    res.render('users/register');
});

app.post('/register', async (req, res) => {
    const user = new User(req.body);
    await user.save();
    res.redirect('/images');
});

app.get('/login', (req, res) => {
    res.render('users/login');
});

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    const user = await User.login(username, password);
    if (user) {
        req.session.userId = user._id;
        res.redirect('/images/myimages');
    } else {
        res.send('Incorrect username or password');
    }
});

app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/images');
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
});