const statusCode = require('../helper/statusCode');
const Rating = require("../routes/models/ratingModel")

const Ratingapi = async (req, res) => {
    const { buyerId, sellerId, rating } = req.body;

    try {
        // Validate input
        if (!buyerId || !sellerId || !rating) {
            return res.status(400).json({ error: 'Buyer ID, Seller ID, and rating are required' });
        }

        // Validate the rating (must be between 1 and 5)
        if (typeof rating !== 'number' || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Rating must be a number between 1 and 5' });
        }

        try {
            // Check if the seller has already rated the buyer
            const existingRating = await Rating.findOne({ buyerId, sellerId });
            if (existingRating) {
                // Update the existing rating
                existingRating.rating = rating;
                await existingRating.save();
                return res.status(200).json({ message: 'Rating updated successfully', rating: existingRating });
            }

            // Create a new rating if it doesn't exist
            const newRating = new Rating({ buyerId, sellerId, rating });
            await newRating.save();

            res.status(201).json({ message: 'Rating submitted successfully', rating: newRating });
        } catch (error) {
            console.error('Error submitting rating:', error);
            res.status(500).json({ error: 'Internal server error' });
        }

    } catch (error) {
        console.error('Error in Rating function:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const averagerating = async (req, res) => {
    
    const { buyerId } = req.query;

    try {
        // Get all ratings for the buyer
        const ratings = await Rating.find({ buyerId });
        if (ratings.length === 0) {
            return res.status(404).json({ error: 'No ratings found for this buyer' });
        }

        // Calculate the average rating
        const totalRating = ratings.reduce((sum, rating) => sum + rating.rating, 0);
        const averageRating = totalRating / ratings.length;

        res.json({ buyerId, averageRating });
    } catch (error) {
        console.error('Error fetching average rating:', error);
        res.status(500).json({ error: 'Internal server error' });
    }

};

module.exports = { Ratingapi, averagerating };