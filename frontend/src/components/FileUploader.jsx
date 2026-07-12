import "../App.css";
import API from "../lib/api";
import { useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";

function FileUploader() {
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [files, setFiles] = useState([]);

    const fetchFiles = async () => {
        try {
            const response = await API.get("/files");
            setFiles(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, []);

    const { getRootProps, getInputProps, open } = useDropzone({
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
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
        },
    });

    const uploadFile = async () => {
        if (selectedFiles.length === 0) {
            alert("Please select files first");
            return;
        }

        const formData = new FormData();

        selectedFiles.forEach((file) => {
            formData.append("files", file);
        });

        try {
            const response = await API.post(
                "/upload",
                formData,
                {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            alert(response.data.message);
            fetchFiles();
            setSelectedFiles([]);
        } catch (error) {
            console.log(error);
            alert("Upload Failed");
        }
    };

    const deleteFile = async (filename) => {

        const confirmDelete = window.confirm(
            `Are you sure you want to delete ${filename}?`
        );

        if (!confirmDelete) {
            return;
        }

        try {
            const response = await API.delete(
                `/delete/${filename}`
            );

            alert(response.data.message);

            fetchFiles();

        } catch (error) {
            console.log(error);
            alert("Delete Failed");
        }
    };

    return (
        <div className="container">
            <h1 className="title">
                <u> <l><b>File Upload System</b></l></u>
            </h1>

            <div {...getRootProps()} className="dropzone">
                <input {...getInputProps()} />

                <p>Drag and Drop Files Here</p>

                <button className="select-btn"
                    onClick={open}
                >
                    Select Files
                </button>
            </div>

            {selectedFiles.length > 0 && (
                <div>
                    <h3 className="selected-title">Selected Files</h3>

                    {selectedFiles.map((file, index) => (
                        <p key={index}>
                            {index + 1}.{file.name}
                        </p>
                    ))}
                </div>
            )}

            <button className="upload-btn"
                onClick={uploadFile}
            >
                Upload Files
            </button>

            <h2 className="uploaded-title">Uploaded Files</h2>

            {files.length === 0 ? (
                <p>No file uploaded</p>
            ) : (
                files.map((file, index) => (
                    <div className="file-card"
                        key={index}

                    >
                        <p>
                            <span
                                style={{
                                    fontSize: "28px",
                                    color: "black",
                                    fontWeight: "bold",
                                }}
                            >
                                {index + 1}.
                            </span>

                            {" "}
                            {file}
                        </p>

                        <button className="open-btn"
                            onClick={() =>
                                window.open(
                                    `http://localhost:5000/uploads/${file}`,
                                    "_blank"
                                )
                            }

                        >
                            Open
                        </button>

                        <button className="delete-btn"
                            onClick={() => deleteFile(file)}

                        >
                            Delete
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}

export default FileUploader;