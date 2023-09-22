const College = require("../models/college");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
  const colleges = await College.paginate(
    {},
    {
      page: req.query.page || 1,
      limit: 10,
      sort: "-_id",
    }
  );
  colleges.page = Number(colleges.page);
  let totalPages = colleges.totalPages;
  let currentPage = colleges.page;
  let startPage;
  let endPage;

  if (totalPages <= 10) {
    startPage = 1;
    endPage = totalPages;
  } else {
    if (currentPage <= 6) {
      startPage = 1;
      endPage = 10;
    } else if (currentPage + 4 >= totalPages) {
      startPage = totalPages - 9;
      endPage = totalPages;
    } else {
      startPage = currentPage - 5;
      endPage = currentPage + 4;
    }
  }
  res.render("colleges/index", {
    colleges,
    startPage,
    endPage,
    currentPage,
    totalPages,
  });
};

module.exports.renderNewForm = (req, res) => {
  res.render("colleges/new");
};

module.exports.createCollege = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.college.location,
      limit: 1,
    })
    .send();
  const college = new College(req.body.college);
  college.geometry = geoData.body.features[0].geometry;
  college.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  college.author = req.user._id;
  await college.save();
  console.log(college);
  req.flash("success", "Successfully made a new college!");
  res.redirect(`/colleges/${college._id}`);
};

module.exports.showCollege = async (req, res) => {
  const college = await College.findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!college) {
    req.flash("error", "Cannot find that college!");
    return res.redirect("/colleges");
  }
  res.render("colleges/show", { college });
};

module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;
  const college = await College.findById(id);
  if (!college) {
    req.flash("error", "Cannot find that college!");
    return res.redirect("/colleges");
  }
  res.render("colleges/edit", { college });
};

module.exports.updateCollege = async (req, res) => {
  const { id } = req.params;
  console.log(req.body);
  const college = await College.findByIdAndUpdate(id, {
    ...req.body.college,
  });
  const imgs = req.files.map((f) => ({ url: f.path, filename: f.filename }));
  college.images.push(...imgs);
  await college.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await college.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated college!");
  res.redirect(`/colleges/${college._id}`);
};

module.exports.deleteCollege = async (req, res) => {
  const { id } = req.params;
  await College.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted college");
  res.redirect("/colleges");
};
