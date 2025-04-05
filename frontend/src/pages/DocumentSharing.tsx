import React, { useState, useRef, useCallback, DragEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Download } from 'lucide-react';
import axios from 'axios';

type FileType = File & { preview?: string };

interface FileInfo {
    name: string;
    size: number;
    type: string;
    downloadUrl: string;
}

enum ProcessingStatus {
    Idle = 'idle',
    Uploading = 'uploading',
    Completed = 'completed',
    Error = 'error',
}

const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
        size /= 1024;
        unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
};

const DocumentSharing: React.FC = () => {
    const [file, setFile] = useState<FileType | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
    const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.Idle);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelection = useCallback((selectedFile: File) => {
        const typedFile = selectedFile as FileType;
        typedFile.preview = URL.createObjectURL(selectedFile);

        setFile(typedFile);
        setStatus(ProcessingStatus.Idle);
        setErrorMessage('');
    }, []);

    const handleFileChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const selectedFile = e.target.files?.[0];
            if (selectedFile) {
                handleFileSelection(selectedFile);
            }
        },
        [handleFileSelection]
    );

    const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback(
        (e: DragEvent<HTMLDivElement>) => {
            e.preventDefault();
            e.stopPropagation();
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile) {
                handleFileSelection(droppedFile);
            }
        },
        [handleFileSelection]
    );

    const removeFile = useCallback(() => {
        if (file?.preview) {
            URL.revokeObjectURL(file.preview);
        }

        setFile(null);
        setStatus(ProcessingStatus.Idle);
        setErrorMessage('');

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [file]);

    const handleSubmit = async () => {
        if (!file) {
            setErrorMessage('Please select a file to upload.');
            return;
        }

        try {
            setStatus(ProcessingStatus.Uploading);

            const fileData = new FormData();
            fileData.append('file', file);

            const response = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', fileData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    pinata_api_key: import.meta.env.VITE_PINATA_API_KEY,
                    pinata_secret_api_key: import.meta.env.VITE_PINATA_SECRET_KEY,
                },
            });

            const fileUrl = 'https://gateway.pinata.cloud/ipfs/' + response.data.IpfsHash;
            console.log(fileUrl);

            // Add uploaded file details to the list
            setUploadedFiles((prevFiles) => [
                ...prevFiles,
                { name: file.name, size: file.size, type: file.type, downloadUrl: fileUrl },
            ]);

            // Show success message temporarily
            setSuccessMessage('File uploaded successfully!');
            setTimeout(() => setSuccessMessage(''), 2000);

            // Clear the current file
            setFile(null);
            setStatus(ProcessingStatus.Completed);
        } catch (error) {
            console.error(error);
            setStatus(ProcessingStatus.Error);
            setErrorMessage('Failed to send the file. Please try again.');
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center min-h-screen p-4 bg-gradient-to-b from-background to-secondary/10"
        >
            <motion.div
                layout
                className="bg-white rounded-xl shadow-2xl w-[80%] h-[75vh] flex flex-col overflow-hidden"
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50"
                >
                    <div>
                        <h1 className="flex items-center space-x-2 text-3xl font-bold text-primary">
                            <FileText className="w-8 h-8 text-primary" />
                            <span>Confi Doc</span>
                        </h1>
                        <p className="mt-2 text-gray-600">Securely store confidential files of any type & size using a decentralized network.</p>
                    </div>
                </motion.div>

                <div className="flex flex-col flex-1 overflow-y-auto">
                    <div className="flex flex-col items-center justify-center p-6">
                        <AnimatePresence>
                            {!file && (
                                <motion.div
                                    key="file-upload"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center justify-center w-full h-64 transition-colors duration-200 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-primary"
                                    onDragOver={handleDragOver}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Upload className="w-12 h-12 mb-4 text-gray-400" />
                                    <p className="mb-2 text-gray-600">Drag and drop your file here</p>
                                    <p className="text-sm text-gray-400">or</p>
                                    <motion.button className="px-4 py-2 mt-2 text-white bg-primary rounded-md">
                                        Select File
                                    </motion.button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                </motion.div>
                            )}

                            {file && (
                                <motion.div
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="w-full"
                                >
                                    <div className="flex items-center justify-between p-4 bg-gray-100 rounded-lg">
                                        <div className="flex items-center space-x-4">
                                            <FileText className="w-8 h-8 text-primary" />
                                            <div>
                                                <p className="font-medium">{file.name}</p>
                                                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                                            </div>
                                        </div>
                                        <motion.button onClick={removeFile} className="text-gray-500 hover:text-gray-700">
                                            <X className="w-6 h-6" />
                                        </motion.button>
                                    </div>
                                    <motion.button
                                        onClick={handleSubmit}
                                        className="w-full py-3 mt-4 text-white bg-primary rounded-md"
                                    >
                                        Upload File
                                    </motion.button>

                                    {status === ProcessingStatus.Error && (
                                        <div className="mt-4 text-red-500">{errorMessage}</div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {successMessage && (
                        <motion.div className="p-4 mt-4 text-center text-green-500">{successMessage}</motion.div>
                    )}

                    <div className="p-6">
                        <h2 className="mb-4 text-2xl font-bold text-primary">Uploaded Files</h2>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {uploadedFiles.map((doc, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 bg-gray-100 rounded-lg shadow"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <p className="font-medium text-gray-700">{doc.name}</p>
                                            <p className="text-sm text-gray-500">{formatFileSize(doc.size)}</p>
                                        </div>
                                        <a
                                            href={doc.downloadUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-primary hover:text-primary-dark"
                                        >
                                            <Download className="w-6 h-6" />
                                        </a>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DocumentSharing;


