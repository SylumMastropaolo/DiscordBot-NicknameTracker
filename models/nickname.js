var mongoose = require("mongoose")
var Schema = mongoose.Schema

var NicknameSchema = new Schema({
    user: String,
    nickname: String,
    channel: Object
})

var Nickname = mongoose.model("Nickname", NicknameSchema)
module.exports = Nickname