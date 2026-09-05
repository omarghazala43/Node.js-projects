import multer from "multer";
import fs from "fs";

export const fileValidation = {
  image: ["image/png", "image/jpeg", "application/octet-stream"],
  video: ["video/mp4"],
};

const localUpload = ({ folder = "", maxSize = 2, fileValidation }) => {
  return multer({
    storage: multer.diskStorage({
      destination: function (req, file, cb) {
        const filePath = `uploads/${folder}`;
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath, { recursive: true });
        }
        cb(null, filePath);
      },
      filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        file.finalPath = `uploads/${folder}/${fileName}`;
        cb(null, fileName);
      },
    }),
    limits: {
      fileSize: 1024 * 1024 * maxSize,
    },
    fileFilter: function (req, file, cb) {
      if (!fileValidation.includes(file.mimetype)) {
        return cb(new Error("Invalid file type "));
      }
      cb(null, true);
    },
  });
};
export default localUpload;
