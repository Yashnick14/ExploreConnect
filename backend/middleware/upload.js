import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this folder exists
  },
  filename: function (req, file, cb) {
  const ext = path.extname(file.originalname);

  // Example: Use place name from form + timestamp → lenzerock-1721.jpg
  const safeName = req.body.name?.toLowerCase().replace(/\s+/g, "-") || "place";

  const uniqueSuffix = Date.now();
  cb(null, `${safeName}-${uniqueSuffix}${ext}`);
  },
});

export const upload = multer({ storage });
