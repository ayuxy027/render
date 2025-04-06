import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Shield, Link, RefreshCw, Terminal } from 'lucide-react';
import { ethers } from 'ethers';
import FileUpload, { UploadedFile as FileUploadFile } from '../components/FileUpload';

// Add Ethereum provider to window object
declare global {
    interface Window {
        ethereum: any;
    }
}

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

// Interface for blockchain log messages
interface BlockchainLog {
    type: 'info' | 'error' | 'success' | 'warning';
    message: string;
    timestamp: Date;
    data?: any;
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
    const [uploadedFiles, setUploadedFiles] = useState<FileInfo[]>([]);
    const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.Idle);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [walletConnected, setWalletConnected] = useState<boolean>(false);
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
    const [_contract, setContract] = useState<ethers.Contract | null>(null);
    const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
    const [showBlockchainLogs, setShowBlockchainLogs] = useState<boolean>(false);
    const [blockchainLogs, setBlockchainLogs] = useState<BlockchainLog[]>([]);
    const blockchainLogsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs to bottom
    useEffect(() => {
        if (blockchainLogsEndRef.current) {
            blockchainLogsEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [blockchainLogs]);

    // Custom blockchain logger
    const logBlockchain = useCallback((type: 'info' | 'error' | 'success' | 'warning', message: string, data?: any) => {
        // Log to browser console
        if (type === 'error') {
            console.error(`[BLOCKCHAIN] ${message}`, data);
        } else if (type === 'warning') {
            console.warn(`[BLOCKCHAIN] ${message}`, data);
        } else if (type === 'success') {
            console.log(`%c[BLOCKCHAIN] ${message}`, 'color: green', data);
        } else {
            console.log(`[BLOCKCHAIN] ${message}`, data);
        }

        // Add to blockchain logs
        setBlockchainLogs(prev => [...prev, {
            type,
            message,
            timestamp: new Date(),
            data
        }]);
    }, []);

    // Setup blockchain connection
    useEffect(() => {
        const initializeBlockchain = async () => {
            // Check if MetaMask is installed
            if (typeof window.ethereum !== 'undefined') {
                try {
                    logBlockchain('info', 'Initializing blockchain connection...');

                    // Setup ethers provider
                    const ethProvider = new ethers.BrowserProvider(window.ethereum);
                    setProvider(ethProvider);
                    logBlockchain('info', 'Ethereum provider initialized');

                    // Create contract instance
                    const midnightStorage = new ethers.Contract(CONTRACT_ADDRESS, MidnightStorageABI, ethProvider);
                    setContract(midnightStorage);
                    logBlockchain('info', 'Contract instance created', {
                        address: CONTRACT_ADDRESS,
                        abi: MidnightStorageABI
                    });

                    // Check if already connected
                    const accounts = await ethProvider.listAccounts();
                    if (accounts.length > 0) {
                        setWalletConnected(true);
                        setWalletAddress(accounts[0].address);
                        logBlockchain('success', 'Wallet already connected', { address: accounts[0].address });

                        // Load files after connecting
                        await loadFilesFromBlockchain();
                    } else {
                        logBlockchain('warning', 'No wallet connected yet. Please connect wallet to interact with blockchain.');
                    }

                    // Setup wallet change listener
                    window.ethereum.on('accountsChanged', (accounts: string[]) => {
                        if (accounts.length > 0) {
                            setWalletConnected(true);
                            setWalletAddress(accounts[0]);
                            logBlockchain('info', 'Wallet changed', { newAddress: accounts[0] });
                            loadFilesFromBlockchain();
                        } else {
                            setWalletConnected(false);
                            setWalletAddress('');
                            setUploadedFiles([]);
                            logBlockchain('warning', 'Wallet disconnected');
                        }
                    });
                } catch (error) {
                    console.error('Failed to initialize blockchain', error);
                    logBlockchain('error', 'Failed to initialize blockchain', error);
                }
            } else {
                logBlockchain('error', 'MetaMask not detected! Please install MetaMask extension.');
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
    }, [logBlockchain]);

    const connectWallet = async () => {
        if (typeof window.ethereum === 'undefined') {
            const errorMsg = 'MetaMask not detected! Please install MetaMask extension: https://metamask.io/download/';
            setErrorMessage(errorMsg);
            logBlockchain('error', errorMsg);
            return;
        }

        if (!provider) return;

        try {
            logBlockchain('info', 'Requesting wallet connection...');

            // Request account access
            await window.ethereum.request({ method: 'eth_requestAccounts' });
            const accounts = await provider.listAccounts();

            if (accounts.length > 0) {
                setWalletConnected(true);
                setWalletAddress(accounts[0].address);
                logBlockchain('success', 'Wallet connected successfully', { address: accounts[0].address });

                // Load files after connecting
                await loadFilesFromBlockchain();
            }
        } catch (error) {
            console.error('Error connecting wallet:', error);
            logBlockchain('error', 'Failed to connect wallet', error);
            setErrorMessage('Failed to connect wallet. Please try again.');
        }
    };

    // Load files from blockchain
    const loadFilesFromBlockchain = async () => {
        if (!walletConnected) return;

        setIsLoadingFiles(true);
        logBlockchain('info', 'Loading files from blockchain...');

        try {
            // In a real implementation, we would query the smart contract
            // For this demo, we'll simulate by returning mock data

            // Clear any existing files
            setUploadedFiles([]);

            // Simulate blockchain delay
            logBlockchain('info', 'Querying smart contract...');
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

            logBlockchain('success', `Found ${files.length} files in registry`);
            setUploadedFiles(files);
        } catch (error) {
            console.error('Error loading files:', error);
            logBlockchain('error', 'Failed to load files from blockchain', error);
            setErrorMessage('Failed to load files from blockchain.');
        } finally {
            setIsLoadingFiles(false);
        }
    };

    // Retrieve file from blockchain
    const retrieveFileFromBlockchain = async (txHash: string): Promise<Uint8Array | null> => {
        setStatus(ProcessingStatus.Retrieving);
        logBlockchain('info', `Retrieving file with transaction hash: ${txHash}`);

        try {
            // Simulate blockchain delay
            logBlockchain('info', 'Querying smart contract for file data...');
            await new Promise(resolve => setTimeout(resolve, 1000));

            // In a real implementation, we would query the smart contract
            const fileData = mockBlockchainStore.get(txHash);

            if (!fileData) {
                const errorMsg = 'File not found in blockchain';
                logBlockchain('error', errorMsg);
                throw new Error(errorMsg);
            }

            logBlockchain('success', 'File data retrieved successfully', {
                name: fileData.name,
                size: fileData.size,
                type: fileData.type
            });

            return fileData.content;
        } catch (error) {
            console.error('Error retrieving file:', error);
            logBlockchain('error', 'Failed to retrieve file from blockchain', error);
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
            logBlockchain('info', `Starting download for file: ${fileInfo.name}`);

            // Retrieve the file content
            const fileContent = await retrieveFileFromBlockchain(fileInfo.txHash);

            if (!fileContent) {
                setErrorMessage('Failed to retrieve file content.');
                return;
            }

            // Create a blob and download link
            logBlockchain('info', 'Creating blob for download...');
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
            logBlockchain('success', 'File download initiated successfully');
        } catch (error) {
            console.error('Error downloading file:', error);
            logBlockchain('error', 'Failed to download file', error);
            setErrorMessage('Failed to download file.');
            setStatus(ProcessingStatus.Error);
        }
    };

    // Handle successful file upload from FileUpload component
    const handleFileUploaded = (fileData: FileUploadFile) => {
        logBlockchain('info', 'File uploaded successfully, storing on blockchain', {
            name: fileData.name,
            cid: fileData.cid,
            size: fileData.size
        });

        // Generate a mock content for the file (in a real app, this would be handled differently)
        const mockContent = new Uint8Array(10); // Just a placeholder

        // Store in mock blockchain for retrieval later
        mockBlockchainStore.set(fileData.txHash, {
            name: fileData.name,
            size: fileData.size,
            type: fileData.type || 'application/octet-stream',
            content: mockContent,
            timestamp: fileData.uploadedAt.getTime()
        });

        // Convert FileUpload's UploadedFile to DocumentSharing's FileInfo
        const newFileInfo: FileInfo = {
            name: fileData.name,
            size: fileData.size,
            type: fileData.type || 'application/octet-stream',
            txHash: fileData.txHash,
            timestamp: fileData.uploadedAt.getTime()
        };

        // Add to uploadedFiles state
        setUploadedFiles(prev => [newFileInfo, ...prev]);

        // Show success message
        setSuccessMessage('File successfully registered on the blockchain!');
        setTimeout(() => setSuccessMessage(''), 3000);

        // Reset status
        setStatus(ProcessingStatus.Completed);
        logBlockchain('success', 'File metadata saved to blockchain', {
            txHash: fileData.txHash
        });
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
            className="flex justify-center items-center p-4 min-h-screen bg-gradient-to-b from-background to-secondary/10"
        >
            <motion.div
                layout
                className="bg-white rounded-xl shadow-2xl w-[80%] h-[75vh] flex flex-col overflow-hidden"
            >
                <motion.div
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex justify-between items-center p-6 bg-gray-50 border-b border-gray-200"
                >
                    <div>
                        <h1 className="flex items-center space-x-2 text-3xl font-bold text-primary">
                            <FileText className="w-8 h-8 text-primary" />
                            <span>Blockchain Storage and Retrieval</span>
                        </h1>
                        <p className="mt-2 text-gray-600">Secure blockchain-based file registration and verification system.</p>
                    </div>
                    <div className="flex gap-4 items-center">
                        {!walletConnected ? (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={connectWallet}
                                className="flex items-center px-4 py-2 text-white bg-indigo-600 rounded-md"
                            >
                                <Shield className="mr-2 w-5 h-5" />
                                Connect Wallet
                            </motion.button>
                        ) : (
                            <>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={loadFilesFromBlockchain}
                                    disabled={isLoadingFiles}
                                    className="flex items-center px-3 py-2 text-indigo-600 rounded-md border border-indigo-600"
                                >
                                    <RefreshCw className={`w-4 h-4 mr-2 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                                    Refresh
                                </motion.button>
                                <div className="flex items-center px-4 py-2 bg-gray-100 rounded-md">
                                    <Shield className="mr-2 w-5 h-5 text-green-500" />
                                    <span className="font-medium">
                                        {walletAddress.substring(0, 6)}...{walletAddress.substring(walletAddress.length - 4)}
                                    </span>
                                </div>
                            </>
                        )}

                        {/* Blockchain logs toggle */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowBlockchainLogs(prev => !prev)}
                            className="flex items-center px-3 py-2 text-gray-600 rounded-md border border-gray-300"
                        >
                            <Terminal className="mr-2 w-4 h-4" />
                            {showBlockchainLogs ? 'Hide' : 'Show'} Logs
                        </motion.button>
                    </div>
                </motion.div>

                <div className="flex overflow-y-auto flex-col flex-1">
                    {/* Blockchain logs */}
                    <AnimatePresence>
                        {showBlockchainLogs && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.3 }}
                                className="border-b border-gray-200"
                            >
                                <div className="p-4 text-white bg-gray-800">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="flex items-center text-lg font-semibold">
                                            <Terminal className="mr-2 w-4 h-4" />
                                            Blockchain Activity Logs
                                        </h3>
                                        <button
                                            onClick={() => setBlockchainLogs([])}
                                            className="px-2 py-1 text-xs text-gray-300 rounded border border-gray-600 hover:text-white"
                                        >
                                            Clear Logs
                                        </button>
                                    </div>
                                    <div className="overflow-y-auto p-2 h-32 font-mono text-xs bg-gray-900 rounded">
                                        {blockchainLogs.length === 0 ? (
                                            <div className="italic text-gray-500">No blockchain activity recorded yet</div>
                                        ) : (
                                            blockchainLogs.map((log, index) => (
                                                <div key={index} className="mb-1">
                                                    <span className="text-gray-500">
                                                        [{log.timestamp.toLocaleTimeString()}]
                                                    </span>{' '}
                                                    <span className={
                                                        log.type === 'error' ? 'text-red-400' :
                                                            log.type === 'success' ? 'text-green-400' :
                                                                log.type === 'warning' ? 'text-yellow-400' :
                                                                    'text-blue-400'
                                                    }>
                                                        {log.type.toUpperCase()}:
                                                    </span>{' '}
                                                    <span>{log.message}</span>
                                                    {log.data && (
                                                        <pre className="ml-6 text-gray-400 whitespace-pre-wrap">{
                                                            typeof log.data === 'object'
                                                                ? JSON.stringify(log.data, null, 2)
                                                                : String(log.data)
                                                        }</pre>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                        <div ref={blockchainLogsEndRef} />
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex flex-col justify-center items-center p-6">
                        <AnimatePresence>
                            {/* FileUpload component */}
                            <motion.div
                                key="file-upload-component"
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="mb-4 w-full"
                            >
                                <FileUpload
                                    walletAddress={walletAddress}
                                    isWalletConnected={walletConnected}
                                    onFileUploaded={handleFileUploaded}
                                />
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {successMessage && (
                        <motion.div className="p-4 mt-4 text-center text-green-500">{successMessage}</motion.div>
                    )}

                    {errorMessage && (
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
                            <div className="flex justify-center items-center h-32">
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
                                        <div className="flex justify-between items-center mb-4">
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
                                                        <Link className="mr-1 w-3 h-3" />
                                                        View on Blockchain
                                                    </a>
                                                    <div>
                                                        <button
                                                            onClick={() => downloadFile(doc)}
                                                            className="inline-flex items-center text-xs text-green-600 hover:underline"
                                                            disabled={status === ProcessingStatus.Retrieving}
                                                        >
                                                            <Download className="mr-1 w-3 h-3" />
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


