const statusCode = require('../helper/statusCode')
const Message = require("../routes/models/messageModel")

const CreateMessage = async (req, res) => {
    try {
        const { sellerId, buyerId, message } = req.body;

        if (!message || !sellerId || !buyerId) {
            return res.status(statusCode.BAD_REQUEST).json({
                status: statusCode.BAD_REQUEST,
                success: false,
                message: "Enter senderId, receiverId, and message"
            });
        }

        // Assign senderId to sellerId and receiverId to buyerId
        const newMessage = await Message.create({
            sellerId: sellerId,  // Treat senderId as sellerId
            buyerId: buyerId,  // Treat receiverId as buyerId
            message
        });

        res.status(statusCode.OK).json({
            status: statusCode.OK,
            success: true,
            message: "Message sent successfully",
            data: newMessage
        });

    } catch (error) {
        console.error("Error:", error);
        res.status(statusCode.INTERNAL_SERVER_ERROR).json({
            status: statusCode.INTERNAL_SERVER_ERROR,
            success: false,
            message: "Internal server error"
        });
    }
};


const getMessages = async (req, res) => {
    try {
        const { buyerId, sellerId } = req.query;

        // Check if buyerId and sellerId are provided
        if (!buyerId || !sellerId) {
            return res.status(400).json({
                status: 400,
                success: false,
                message: "Both buyerId and sellerId are required",
            });
        }

        console.log('Buyer ID:', buyerId);
        console.log('Seller ID:', sellerId);
        // Fetch messages where buyerId and sellerId match in either direction
        const messages = await Message.find({
            $or: [
                { buyerId, sellerId },  // Messages where buyer is the sender and seller is the receiver
                { buyerId: sellerId, sellerId: buyerId }  // Messages where seller is the sender and buyer is the receiver
            ]
        });

  console.log("messages",messages);

        if (messages.length === 0) {
            return res.status(404).json({
                status: 404,
                success: false,
                message: "No messages found between the buyer and seller"
            });
        }

        // Map messages and identify who the sender is, include send time
        const messagesWithSender = messages.map(msg => ({
            _id: msg._id,
            message: msg.message,
            buyerId: msg.buyerId,
            sellerId: msg.sellerId,
            senderId: msg.sellerId === sellerId ? sellerId : buyerId,  // Identify the sender for each message
            sendTime: msg.createdAt,  // Include message send time
            createdAt: msg.createdAt,
            updatedAt: msg.updatedAt
        }));

        return res.status(200).json({
            status: 200,
            success: true,
            message: "Messages retrieved successfully",
            data: messagesWithSender
        });

    } catch (error) {
        console.error("Error fetching messages:", error);
        return res.status(500).json({
            status: 500,
            success: false,
            message: "Internal server error"
        });
    }
};





module.exports = { CreateMessage ,getMessages };



