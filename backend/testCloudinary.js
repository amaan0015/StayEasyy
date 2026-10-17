require("dotenv").config();

const cloudinary = require("./config/cloudinary");

const testUpload = () => {
  return new Promise((resolve, reject) => {
    // Tiny 1x1 PNG image
    const imageBuffer = Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=",
      "base64"
    );

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "stayeasyy/properties",
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error("UPLOAD FAILED:");
          console.error(error);
          reject(error);
        } else {
          console.log("UPLOAD SUCCESSFUL:");
          console.log(result);
          resolve(result);
        }
      }
    );

    uploadStream.end(imageBuffer);
  });
};

testUpload().catch(() => {
  process.exit(1);
});