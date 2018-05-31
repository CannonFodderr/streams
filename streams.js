const   fs      = require('fs'),
        express = require('express'),
        app     = express(),
        path    = require('path'),
        mongoose = require('mongoose'),
        port    = process.env.PORT || 8080,
        dbUrl   = process.env.DBURL || 'mongodb://localhost/streaming',
        Video   = require('./models/videos')

mongoose.connect(dbUrl).then((e)=>{
    console.log('Connected to DB')
}).catch((e)=>{
    console.error('Bad stuff in DB...')
})

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname + '/public')));

// =======
// Routes
// =======
app.get('/', (req, res)=>{
    res.render('index')
})
app.get('/video', (req, res)=>{
    const dbVideo = Video.findById("5b10018304beb122003fe704").then((foundVideo)=>{
    console.log(foundVideo);
    const path = foundVideo.path;
    const readStream = fs.createReadStream(path);
    const stat = fs.statSync(path);
    const fileSize = stat.size;
    const range = req.headers.range;
    if(range){
        const parts = range.replace(/bytes=/, "").split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1]
        ?parseInt(parts[1], 10)
        :fileSize - 1
        const chunk = (end-start)+1;
        const file = fs.createReadStream(path, {start, end});
        const head = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunk,
            'Content-Type': 'video/mp4',
        }
        res.writeHead(206, head);
        file.pipe(res);
        // =================
        // Console Debugging
        // =================
        console.log('Parts: ' + parts);
        console.log('Start: ' + start);
        console.log('End: ' + end);
        console.log('Chunk: ' + chunk);
        console.log('=================');
    } else {
        const head = {
            'Content-Type': 'video/mp4',
            'Content-Length': fileSize
        }
        res.writeHead(200, head);
        readStream.pipe(res);
    }
    }).catch((e)=>console.error(e))
    
})
// Camera route
app.get('/camera', (req, res)=>{
    res.render('camera')  
});

app.post('/postvideo', (req, res)=>{
    // newVideo = {
    //     title: 'RC505',
    //     path: './videos/video2.mp4'
    // }
    Video.create(newVideo)
    .then((v)=>{console.log('video was added to DB')}).catch((e)=>console.error('Failed to create new video'));
})

app.listen(port, (req, res)=>{
    console.log(`Server is running on port ${port}`);
})