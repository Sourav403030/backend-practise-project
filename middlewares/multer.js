const multer = require("multer");

const storage = multer.diskStorage({ // Set the storage engine
  destination: function (req, file, cb) {  // Set the destination for file uploads
    cb(null, './public/temp');
  },
  filename: function (req, file, cb) { // Set the filename for the uploaded file
    cb(null, file.originalname);
  }
})

const upload = multer({ storage: storage }) // Create the multer upload instance with the defined storage

module.exports = upload;