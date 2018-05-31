const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema ({
    title: String,
    path: String,
})

module.exports = mongoose.model("Video", videoSchema)