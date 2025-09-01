import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    let ext = path.extname(file.originalname || "").toLowerCase();

    // fallback extension
    if (!ext || ext === "") {
      ext = ".jpg";
    }

    if (file.fieldname === "avatar") {
      const userId = req.user?._id || "user";
      return cb(null, `avatar-${userId}-${Date.now()}${ext}`);
    }

    // fallback for place images
    const safeName =
      req.body.name?.toLowerCase().replace(/\s+/g, "-") || "place";
    cb(null, `${safeName}-${Date.now()}${ext}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [".jpg", ".jpeg", ".png", ".webp"];
    let ext = path.extname(file.originalname || "").toLowerCase();

    // fallback
    if (!ext) ext = ".jpg";

    if (!allowed.includes(ext)) {
      return cb(new Error("Only .jpg, .jpeg, .png, .webp files allowed"));
    }
    cb(null, true);
  },
});
