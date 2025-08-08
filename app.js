const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const app = express();

mongoose.connect('mongodb://localhost:27017/TreeShop', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const treeSchema = new mongoose.Schema({
    treename: String,
    description: String,
    image: String
});

const Tree = mongoose.model('TreeCollection', treeSchema);

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

app.post('/add', upload.single('image'), async (req, res) => {
    const { treename, description } = req.body;
    const image = req.file ? '/uploads/' + req.file.filename : '';
    
    if (!treename || !description) {
        return res.send('Tree Name and Description are required!');
    }
    
    await Tree.create({ 
        treename, 
        description, 
        image 
    });
    
    res.redirect('/');
});

app.post('/reset', async (req, res) => {
    await Tree.deleteMany({});
    res.redirect('/');
});

app.get('/', async (req, res) => {
    const trees = await Tree.find();
    res.render('index', { trees });
});;

app.get('/about', (req, res) => {
    res.render('about');
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});