const  express = require ("express")
// const dotenv = require("dotenv").config();
const connect = require("./src/utils/db")
const cors = require('cors');
const app = express();

const corsOption = {
    origin:"*",
    methods : "GET ,POST ,PUT , DELETE",
    Credential:true
}

app.use(cors(corsOption));  
app.use(express.json());

const port = process.env.PORT  ||  5000;

app.use("/", require("./src/routes/authRoutes"));

connect().then(() => {

app.listen(port ,() =>{
 console.log(`server running in ${port}`);
});
})