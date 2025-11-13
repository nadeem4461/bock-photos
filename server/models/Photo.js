import mongoose from "mongoose";

const PhotoSchema = new mongoose.Schema({
userId:{type:mongoose.Schema.Types.ObjectId,ref:'User',required:true},
name : String,
mimeType:String,
size :Number,
path :String,
thumbPath :String,
phash :String,
duplicateOf :{type :mongoose.Schema.Types.ObjectId,ref:'Photo'},
exif : Object,
createdAt :{type:Date,default:Date.now}

});

export default mongoose.model("Photo", PhotoSchema);