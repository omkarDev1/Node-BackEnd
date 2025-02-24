const mongoose = require("mongoose")

 const URI = process.env.MONGODB_URI
mongoose.connect(URI)


const connect = async () => {
    try {
        await mongoose.connect(URI)
        console.log("database connect successfully");
    } catch (error) {
        console.log("data base no connect");
        process.exit(0)
    }
};

module.exports = connect;