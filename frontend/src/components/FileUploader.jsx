import "../App.css";
import API from "../lib/api";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

import {
    FaCloudUploadAlt,
    FaHome,
    FaUpload,
    FaCheckCircle,
    FaCog,
    FaFilePdf,
    FaFileExcel,
    FaFileImage,
    FaFileCsv
} from "react-icons/fa";

function FileUploader() {

    const [selectedFiles, setSelectedFiles] = useState([]);
    const [files, setFiles] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [activePage, setActivePage] = useState("dashboard");
    const [fileDetails, setFileDetails] = useState(null);

    const fetchFiles = async () => {
        try {
            const response = await API.get("/files");
            setFiles(response.data);
        }
        catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const filteredFiles = files.filter((file) =>
        file.name.toLowerCase().includes(
            searchTerm.toLowerCase()
        )
    );

    const { getRootProps, getInputProps, open } =
        useDropzone({
            onDrop: (acceptedFiles) => {
                setSelectedFiles(acceptedFiles);
            },

            multiple: true,
            noClick: true,
            noKeyboard: true,

            accept: {
                "application/pdf": [".pdf"],
                "text/csv": [".csv"],
                "image/png": [".png"],
                "image/jpeg": [".jpg", ".jpeg"],
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"]
            }
        });

    const uploadFile = async () => {

        if (selectedFiles.length === 0) {
            alert("Select Files First");
            return;
        }

        const formData = new FormData();

        selectedFiles.forEach((file) => {
            formData.append("files", file);
        });

        try {

            const response =
                await API.post(
                    "/upload",
                    formData,
                    {
                        headers: {
                            "Content-Type":
                                "multipart/form-data"
                        }
                    }
                );

            alert(response.data.message);

            fetchFiles();
            setSelectedFiles([]);

        }
        catch (error) {
            console.log(error);
            alert("Upload Failed");
        }
    };

    const deleteFile = async (filename) => {

        if (!window.confirm(
            `Delete ${filename} ?`
        )) return;

        try {

            const response =
                await API.delete(
                    `/delete/${filename}`
                );

            alert(response.data.message);

            fetchFiles();

        }
        catch (error) {
            console.log(error);
        }
    };
    const showDetails = (file) => {

        const extension =
            file.name.split(".").pop().toUpperCase();

        setFileDetails({
            name: file.name,
            type: extension,
            size: file.size,
            uploaded: file.uploaded,
            path: `/uploads/${file.name}`
        });
    };
    const resetAllFiles = async () => {
        const confirmReset = window.confirm(
            "Are you sure you want to delete all uploaded files?"
        );

        if (!confirmReset) return;

        try {
            const response = await API.delete("/reset");

            alert(response.data.message);

            setSelectedFiles([]);
            setFiles([]);
            fetchFiles();
        }
        catch (error) {
            console.log(error);
            alert("Reset Failed");
        }
    };

    const getFileIcon = (filename) => {

        if (filename.endsWith(".pdf"))
            return <FaFilePdf color="red" />;

        if (filename.endsWith(".xlsx"))
            return <FaFileExcel color="green" />;

        if (filename.endsWith(".csv"))
            return <FaFileCsv color="blue" />;

        if (
            filename.endsWith(".jpg") ||
            filename.endsWith(".jpeg") ||
            filename.endsWith(".png")
        )
            return <FaFileImage color="orange" />;

        return "📁";
    };

    return (
        <div className="container">

            <header className="header">
                <h1 className="project-title">
                    File Upload System
                </h1>

                <p className="subtitle">
                    Secure File Upload, Validation and Management
                </p>
            </header>

            {/* Navbar */}

            <div className="navbar">

                <div className="logo-section">
                    <FaCloudUploadAlt className="logo-icon" />

                    <h2>
                        FILE UPLOAD SYSTEM
                    </h2>
                </div>

                <div
                    className="nav-item"
                    onClick={() =>
                        setActivePage("dashboard")
                    }
                >
                    <FaHome />
                    <span>Dashboard</span>
                </div>

                <div
                    className="nav-item"
                    onClick={() =>
                        setActivePage("upload")
                    }
                >
                    <FaUpload />
                    <span>Upload Files</span>
                </div>

                <div
                    className="nav-item"
                    onClick={() =>
                        setActivePage("validation")
                    }
                >
                    <FaCheckCircle />
                    <span>Validation</span>
                </div>

                <div
                    className="nav-item"
                    onClick={() =>
                        setActivePage("settings")
                    }
                >
                    <FaCog />
                    <span>Settings</span>
                </div>

            </div>

            {/* Dashboard */}

            {
                activePage === "dashboard" && (
                    <>
                        <div
                            {...getRootProps()}
                            className="dropzone"
                        >
                            <input
                                {...getInputProps()}
                            />

                            <h2>
                                Drag & Drop Files Here
                            </h2>

                            <button
                                className="select-btn"
                                onClick={open}
                            >
                                Select Files
                            </button>
                        </div>

                        {
                            selectedFiles.length > 0 && (
                                <div className="selected-files">

                                    <h3>
                                        Selected Files
                                    </h3>

                                    {
                                        selectedFiles.map(
                                            (
                                                file,
                                                index
                                            ) => (
                                                <p key={index}>
                                                    {
                                                        index + 1
                                                    }
                                                    .
                                                    {
                                                        file.name
                                                    }
                                                </p>
                                            )
                                        )
                                    }

                                </div>
                            )
                        }

                        <button
                            className="upload-btn"
                            onClick={uploadFile}
                        >
                            Upload Files
                        </button>
                    </>
                )
            }

            {/* Upload Page */}

            {
                activePage === "upload" && (
                    <>
                        <input
                            type="text"
                            placeholder="Search Files..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                            className="search-input"
                        />

                        <h2 className="uploaded-title">
                            Uploaded Files
                        </h2>

                        {
                            filteredFiles.map(
                                (
                                    file,
                                    index
                                ) => (
                                    <div
                                        className="file-card"
                                        key={index}
                                    >
                                        <div>
                                            {getFileIcon(file.name)} {file.name}
                                        </div>

                                        <div>

                                            <button
                                                className="open-btn"
                                                onClick={() =>
                                                    window.open(
                                                        `http://localhost:5000/uploads/${file.name}`,
                                                        "_blank"
                                                    )
                                                }
                                            >
                                                Open
                                            </button>
                                            <button
                                                className="details-btn"
                                                onClick={() => showDetails(file)}
                                            >
                                                File Details
                                            </button>

                                            <button
                                                className="delete-btn"
                                                onClick={() =>
                                                    deleteFile(
                                                        file.name
                                                    )
                                                }
                                            >
                                                Delete
                                            </button>

                                        </div>
                                    </div>
                                )
                            )
                        }
                        {
                            fileDetails && (
                                <div className="details-box">

                                    <h2>📄 File Details</h2>

                                    <p><b>File Name:</b> {fileDetails.name}</p>

                                    <p><b>File Type:</b> {fileDetails.type}</p>

                                    <p><b>File Size:</b> {fileDetails.size}</p>

                                    <p><b>Upload Date:</b> {fileDetails.uploaded}</p>

                                    <p><b>Path:</b> {fileDetails.path}</p>

                                    <button
                                        className="close-btn"
                                        onClick={() => setFileDetails(null)}
                                    >
                                        Close
                                    </button>

                                </div>
                            )
                        }

                    </>
                )
            }

            {/* Validation Page */}

            {
                activePage === "validation" && (
                    <div className="validation-box">

                        <h2>
                            Validation Rules
                        </h2>

                        <p>✅ PDF Allowed</p>
                        <p>✅ CSV Allowed</p>
                        <p>✅ XLSX Allowed</p>
                        <p>✅ JPG Allowed</p>
                        <p>✅ PNG Allowed</p>
                        <p>❌ EXE Not Allowed</p>
                        <p>📏 Maximum Size 10 MB</p>

                    </div>
                )
            }

            {/* Settings Page */}

            {
                activePage === "settings" && (
                    <div className="settings-box">


                        <h2>
                            Settings
                        </h2>

                        <p>
                            Backend Port :
                            5000
                        </p>

                        <p>
                            Upload Folder :
                            uploads
                        </p>

                        <p>
                            Max Files :
                            20
                        </p>

                        <p>
                            Allowed Files :
                            PDF, CSV,
                            XLSX, JPG, PNG
                        </p>
                        <button
                            className="reset-btn"
                            onClick={resetAllFiles}
                        >
                            Reset All Files
                        </button>

                    </div>
                )
            }

        </div>
    );
}

export default FileUploader;