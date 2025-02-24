const mongoose = require("mongoose")
//   const URI ="mongodb+srv://omkar-45:omkar9696@cluster0.0p4jly7.mongodb.net/"

// const URI = "mongodb+srv://omkar-45:omkar9696@cluster0.0p4jly7.mongodb.net/user_admin?retryWrites=true&w=majority&appName=Cluster0"
 const URI = "mongodb+srv://agrisell:agrisell123@cluster0.2bera.mongodb.net/user_Database?retryWrites=true&w=majority&appName=Cluster0"
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