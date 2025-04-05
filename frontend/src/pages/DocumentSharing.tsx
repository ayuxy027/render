import React, { useState, useRef, useCallback, DragEvent, ChangeEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, Download, Shield, Link, RefreshCw } from 'lucide-react';
import { ethers } from 'ethers';

// Add Ethereum provider to window object
declare global {
    interface Window {
        ethereum: any;
    }
}

type FileType = File & { preview?: string };

interface FileInfo {
    name: string;
    size: number;
    type: string;
    txHash: string;
    timestamp: number;
    content?: Uint8Array;
}

enum ProcessingStatus {
    Idle = 'idle',
    Processing = 'processing',
    Retrieving = 'retrieving',
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

// Simple smart contract ABI for file storage
const MidnightStorageABI = [
    "function storeFile(string memory filename, string memory fileType, uint256 fileSize, bytes memory fileHash) public returns (uint256)",
    "function getFileCount() public view returns (uint256)",
    "function getFile(uint256 fileId) public view returns (string memory, string memory, uint256, bytes memory, uint256)"
];

// Contract address (this would be the address of a deployed contract on the blockchain)
const CONTRACT_ADDRESS = "0x0000000000000000000000000000000000000000";

// Mock blockchain data store for simulation purposes
const mockBlockchainStore = new Map<string, {
    name: string,
    type: string,
    size: number,
    content: Uint8Array,
    timestamp: number
}>();

const DocumentSharing: React.FC = () => {
    const [file, setFile] = useState<FileType | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
    const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.Idle);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [contract, setContract] = useState<ethers.Contract | null>(null);
    const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Setup blockchain connection
    useEffect(() => {
        const initializeBlockchain = async () => {
            // Check if MetaMask is installed
            if (typeof window.ethereum !== 'undefined') {
                try {
                    // Setup ethers provider
                    const ethProvider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(ethProvider);

                    // Create contract instance
                    const midnightStorage = new ethers.Contract(CONTRACT_ADDRESS, MidnightStorageABI, ethProvider);
                    setContract(midnightStorage);

                    // Check if already connected
                    const accounts = await ethProvider.listAccounts();
                    if (accounts.length > 0) {
                        setWalletConnected(true);
                        setWalletAddress(accounts[0].address);

                        // Load files after connecting
                        await loadFilesFromBlockchain();
                    }

                    // Setup wallet change listener
                    window.ethereum.on('accountsChanged', (accounts: string[]) => {
                        if (accounts.length > 0) {
                            setWalletConnected(true);
                            setWalletAddress(accounts[0]);
                            loadFilesFromBlockchain();
                        } else {
                            setWalletConnected(false);
                            setWalletAddress('');
                            setUploadedFiles([]);
                        }
                    });
                } catch (error) {
                    console.error('Failed to initialize blockchain', error);
                }
            }
        };

        initializeBlockchain();

        // Cleanup function
        return () => {
            if (window.ethereum && window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', () => {
                    console.log('Listener removed');
                });
            }
        };
    }, []);

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            setErrorMessage(
                'MetaMask not detected! Please install MetaMask extension: https://metamask.io/download/'
            );
            return;
        }

        if (!provider) return;

        try {
            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await provider.listAccounts();

            if (accounts.length > 0) {
                setWalletConnected(true);
                setWalletAddress(accounts[0].address);

                // Load files after connecting
                await loadFilesFromBlockchain();
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            setErrorMessage('Failed to connect wallet. Please try again.');
        }
    };

    // Load files from blockchain
    const loadFilesFromBlockchain = async () => {
        if (!walletConnected) return;

        setIsLoadingFiles(true);
        try {
            // In a real implementation, we would query the smart contract
            // For this demo, we'll simulate by returning mock data

            // Clear any existing files
            setUploadedFiles([]);

            // Simulate blockchain delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Get files from our mock store
            const files: FileInfo[] = [];
            mockBlockchainStore.forEach((value, key) => {
                files.push({
                    name: value.name,
                    size: value.size,
                    type: value.type,
                    txHash: key,
                    timestamp: value.timestamp
                });
            });

            setUploadedFiles(files);
        } catch (error) {
            console.error('Error loading files:', error);
            setErrorMessage('Failed to load files from blockchain.');
        } finally {
            setIsLoadingFiles(false);
        }
    };

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

    // Function to prepare file for blockchain storage
    const prepareFileForBlockchain = async (fileToStore: File): Promise<Uint8Array> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (event) => {
                if (!event.target || !event.target.result) {
                    reject(new Error('Failed to read file'));
                    return;
                }

                const arrayBuffer = event.target.result as ArrayBuffer;
                const bytes = new Uint8Array(arrayBuffer);

                // For large files, we would hash the content instead of storing directly
                // This is a simplified example - in real implementation, we'd use IPFS or another storage solution
                // and only store the hash on-chain
                resolve(bytes);
            };

            reader.onerror = () => reject(reader.error);
            reader.readAsArrayBuffer(fileToStore);
        });
    };

    // For demo purposes, we'll simulate blockchain storage
    const simulateBlockchainStorage = async (
        fileName: string,
        fileType: string,
        fileSize: number,
        fileContent: Uint8Array
    ): Promise<string> => {
        // Generate a transaction hash
        const txHash = "0x" + Array.from(crypto.getRandomValues(new Uint8Array(32)))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');

        // Store in our mock blockchain store
        mockBlockchainStore.set(txHash, {
            name: fileName,
            type: fileType,
            size: fileSize,
            content: fileContent,
            timestamp: Date.now()
        });

        return txHash;
    };

    // Retrieve file from blockchain
    const retrieveFileFromBlockchain = async (txHash: string): Promise<Uint8Array | null> => {
        setStatus(ProcessingStatus.Retrieving);

        try {
            // Simulate blockchain delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real implementation, we would query the smart contract
            const fileData = mockBlockchainStore.get(txHash);

            if (!fileData) {
                throw new Error('File not found in blockchain');
            }

            return fileData.content;
        } catch (error) {
            console.error('Error retrieving file:', error);
            setErrorMessage('Failed to retrieve file from blockchain.');
            return null;
        } finally {
            setStatus(ProcessingStatus.Idle);
        }
    };

    // Download file from blockchain
    const downloadFile = async (fileInfo: FileInfo) => {
        try {
            setStatus(ProcessingStatus.Retrieving);

            // Retrieve the file content
            const fileContent = await retrieveFileFromBlockchain(fileInfo.txHash);

            if (!fileContent) {
                setErrorMessage('Failed to retrieve file content.');
                return;
            }

            // Create a blob and download link
            const blob = new Blob([fileContent], { type: fileInfo.type || 'application/octet-stream' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = fileInfo.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);

            URL.revokeObjectURL(url);
            setStatus(ProcessingStatus.Idle);
        } catch (error) {
            console.error('Error downloading file:', error);
            setErrorMessage('Failed to download file.');
            setStatus(ProcessingStatus.Error);
        }
    };

    const handleSubmit = async () => {
        if (!file) {
            setErrorMessage('Please select a file to upload.');
            return;
        }

        if (!walletConnected) {
            setErrorMessage('Please connect your wallet first.');
            return;
        }

        try {
            setStatus(ProcessingStatus.Processing);

            // For demo purposes, we'll simulate blockchain storage instead of actually 
            // uploading large files to the blockchain (which would be impractical)
            const fileBytes = await prepareFileForBlockchain(file);

            // In a real implementation, we'd use IPFS or similar for file storage
            // and only store the hash/metadata on blockchain
            const txHash = await simulateBlockchainStorage(
                file.name,
                file.type,
                file.size,
                fileBytes // Use full file content for storage
            );

            // Add uploaded file details to the list
            setUploadedFiles((prevFiles) => [
                ...prevFiles,
                {
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    txHash,
                    timestamp: Date.now()
                },
            ]);

            // Show success message
            setSuccessMessage('File successfully registered on the blockchain!');
            setTimeout(() => setSuccessMessage(''), 3000);

            // Clear the current file
            setFile(null);
            setStatus(ProcessingStatus.Completed);

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error(error);
            setStatus(ProcessingStatus.Error);
            setErrorMessage('Failed to process the file. Please try again.');
        }
    };

    // Get status message
    const getStatusMessage = () => {
        switch (status) {
            case ProcessingStatus.Processing:
                return 'Processing file for blockchain storage...';
            case ProcessingStatus.Retrieving:
                return 'Retrieving file from blockchain...';
            case ProcessingStatus.Completed:
                return 'Operation completed successfully!';
            case ProcessingStatus.Error:
                return errorMessage;
            default:
                return '';
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
                            <span>Midnight Blockchain</span>
                        </h1>
                        <p className="mt-2 text-gray-600">Secure blockchain-based file registration and verification system.</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {!walletConnected ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={connectWallet}
                                className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md"
                            >
                                <Shield className="w-5 h-5 mr-2" />
                                Connect Wallet
                            </motion.button>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={loadFilesFromBlockchain}
                                    disabled={isLoadingFiles}
                                    className="flex items-center px-3 py-2 text-indigo-600 border border-indigo-600 rounded-md"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                                    Refresh
                                </motion.button>
                                <div className="flex items-center px-4 py-2 bg-gray-100 rounded-md">
                                    <Shield className="w-5 h-5 mr-2 text-green-500" />
                                    <span className="font-medium">
                                        {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                                    </span>
                                </div>
                            </>
                        )}
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
                                        className="w-full py-3 mt-4 text-white bg-primary rounded-md disabled:bg-gray-400"
                                        disabled={!walletConnected}
                                    >
                                        {status === ProcessingStatus.Processing ? 'Processing...' : 'Register on Blockchain'}
                                    </motion.button>

                                    {!walletConnected && (
                                        <p className="mt-2 text-sm text-center text-red-500">
                                            Please connect your wallet first
                                        </p>
                                    )}

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

                    {errorMessage && !file && (
                        <motion.div className="p-4 mt-4 text-center text-red-500">{errorMessage}</motion.div>
                    )}

                    {/* Status messages */}
                    {status !== ProcessingStatus.Idle && status !== ProcessingStatus.Error && (
                        <motion.div
                            className="p-4 mt-4 text-center text-indigo-600"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            {getStatusMessage()}
                        </motion.div>
                    )}

                    <div className="p-6">
                        <h2 className="mb-4 text-2xl font-bold text-primary">Blockchain Registry</h2>
                        {isLoadingFiles ? (
                            <div className="flex items-center justify-center h-32">
                                <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin" />
                                <span className="ml-2 text-indigo-600">Loading files from blockchain...</span>
                            </div>
                        ) : uploadedFiles.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg">
                                No files found in the blockchain registry.
                                {walletConnected && (
                                    <p className="mt-2 text-sm">Upload a file to get started, or connect a different wallet.</p>
                                )}
                                {!walletConnected && (
                                    <p className="mt-2 text-sm">Connect your wallet to view your files.</p>
                                )}
                            </div>
                        ) : (
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
                                                <p className="text-xs text-gray-500">
                                                    {new Date(doc.timestamp).toLocaleString()}
                                                </p>
                                                <div className="mt-2 space-y-1">
                                                    <a
                                                        href={`https://sepolia.etherscan.io/tx/${doc.txHash}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center text-xs text-indigo-600 hover:underline"
                                                    >
                                                        <Link className="w-3 h-3 mr-1" />
                                                        View on Blockchain
                                                    </a>
                                                    <div>
                                                        <button
                                                            onClick={() => downloadFile(doc)}
                                                            className="inline-flex items-center text-xs text-green-600 hover:underline"
                                                            disabled={status === ProcessingStatus.Retrieving}
                                                        >
                                                            <Download className="w-3 h-3 mr-1" />
                                                            {status === ProcessingStatus.Retrieving ? 'Retrieving...' : 'Download File'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                                                Verified
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default DocumentSharing;


