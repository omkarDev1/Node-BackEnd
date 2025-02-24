const  express = require ("express")
const dotenv = require("dotenv").config();
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

app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/message", require("./src/routes/messageRoutes"));
app.use("/api/seller", require("./src/routes/sellerRoutes"));
app.use("/api/buyer", require("./src/routes/buyerRoutes"));
app.use("/api/rate", require("./src/routes/ratingRoutes"));



connect().then(() => {

app.listen(port ,() =>{
 console.log(`server running in ${port}`);
});
})