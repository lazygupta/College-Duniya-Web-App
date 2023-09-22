const College = require("../models/college");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  const college = await College.findById(req.params.id);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  college.reviews.push(review);
  await review.save();
  await college.save();
  req.flash("success", "Created new review!");
  res.redirect(`/colleges/${college._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await College.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Successfully deleted review");
  res.redirect(`/colleges/${id}`);
};
