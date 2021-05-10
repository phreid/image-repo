const mongoose = require('mongoose');
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

db.once('close', () => {
    console.log('Connection closed');
});

const userIds = [new mongoose.Types.ObjectId(), new mongoose.Types.ObjectId()];

const userSeeds = [
    new User({
        _id: userIds[0],
        username: 'user1',
        password: 'user1'
    }),
    new User({
        _id: userIds[1],
        username: 'user2',
        password: 'user2'
    })
];

const imageSeeds = [
    new Image({
        title: 'image1',
        author: userIds[0],
        price: 5.99,
        description: 'image of a boat',
        quantity: 5,
        src: '/boat.jpg'
    }),
    new Image({
        title: 'image2',
        author: userIds[1],
        price: 30,
        description: 'picture of a mountain',
        quantity: 1,
        src: '/mountain.jpg'
    }),
    new Image({
        title: 'image3',
        author: userIds[1],
        price: 10.50,
        description: 'old house',
        quantity: 99,
        src: '/house.jpg'
    }),
];

const seedDB = async () => {
    await User.deleteMany({});
    for (let user of userSeeds) {
        await user.save();
    }

    await Image.deleteMany({});
    for (let image of imageSeeds) {
        await image.save();
    }

    db.close();
}

seedDB();