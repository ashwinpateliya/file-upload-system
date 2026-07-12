const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// Create uploads folder if it does not exist
if (!fs.existsSync("uploads")) {
    fs.mkdirSync("uploads");
}

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads/");
    },

    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

// File Validation
const upload = multer({
    storage: storage,

    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB
    },

    fileFilter: (req, file, cb) => {

        const allowedTypes = [
            "application/pdf",
            "text/csv",
            "image/png",
            "image/jpeg",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF, CSV, XLSX, JPG and PNG files are allowed."));
        }
    },
});

// Home Route
app.get("/", (req, res) => {
    res.send("Backend Server Running");
});

// Upload Files
app.post("/upload", upload.array("files", 20), (req, res) => {

    console.log("Received Files:", req.files);

    if (!req.files || req.files.length === 0) {
        return res.status(400).json({
            message: "No file uploaded",
        });
    }

   res.json({
            message: "Files Uploaded Successfully",
            files: req.files.map(
                file => file.filename
            ),
        });
    }
);

// Get Uploaded Files
app.get("/files", (req, res) => {

    fs.readdir("./uploads", (err, files) => {

        if (err) {
            return res.status(500).json({
                message: "Unable to fetch files",
            });
        }

        res.json(files);
    });
});

// Delete File
app.delete("/delete/:filename", (req, res) => {

    const filePath = path.join(
        __dirname,
        "uploads",
        req.params.filename
    );

    if (fs.existsSync(filePath)) {

        fs.unlinkSync(filePath);

        return res.json({
            message:"File Deleted Successfully",
        });
    }

    res.status(404).json({
        message: "File Not Found",
    });


});

// Open Uploaded Files
app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);

// Global Error Handler
app.use((error, req, res, next) => {
    res.status(500).json({
        message: error.message,
    });
});

// Start Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server Running on Port ${PORT}`);
});