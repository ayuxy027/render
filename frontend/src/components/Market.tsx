import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    Search,
    Star,
    ShoppingCart,
} from "lucide-react";

// Check required environment variables
const checkRequiredEnvVars = () => {
    const required = [
        'VITE_RAZORPAY_KEY_ID',
        'VITE_RAZORPAY_KEY_SECRET'
    ];

    const missing = required.filter(key => !import.meta.env[key]);

    if (missing.length > 0) {
        console.error('❌ Missing required environment variables:', missing);
        throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }

    console.log('✅ All required environment variables are set');
};

// Logger utility
const logPaymentFlow = (stage: string, data?: any) => {
    console.group(`💸 Payment Flow: ${stage}`);
    if (data) console.log(data);
    console.groupEnd();
};

interface Product {
    id: number;
    name: string;
    image: string;
    price: number;
    rentalPrice: number;
    description: string;
    category: string;
    rating: number;
    available: boolean;
    stock: number;
    featured?: boolean;
    discount?: number;
    specifications?: string[];
}

const products: Product[] = [
    {
        id: 1,
        name: "Drip Irrigation Kit",
        image: "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?auto=format&fit=crop&q=80",
        price: 5000,
        rentalPrice: 800,
        description: "Water-efficient drip irrigation system ideal for Indian climate",
        category: "Irrigation",
        rating: 4.7,
        available: true,
        stock: 20,
        featured: true,
        specifications: ["Water-saving", "Easy Installation", "Weather-resistant", "Coverage: 1 Acre"]
    },
    {
        id: 2,
        name: "Seeds Packet",
        image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80",
        price: 4999,
        rentalPrice: 0,
        description: "Premium indigenous seed varieties for Indian farming conditions",
        category: "Seeds",
        rating: 4.6,
        available: true,
        stock: 75,
        discount: 16,
        specifications: ["Indigenous Varieties", "High-yield", "Drought-resistant", "Non-GMO"]
    },
    {
        id: 3,
        name: "Kisan Sprayer Drone",
        image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80",
        price: 50000,
        rentalPrice: 2500,
        description: "Made in India drone for efficient crop spraying and monitoring",
        category: "Technology",
        rating: 4.9,
        available: true,
        stock: 8,
        featured: true,
        specifications: ["HD Camera", "25min Flight Time", "GPS Enabled", "10L Tank"]
    },
    {
        id: 4,
        name: "Digital Soil Testing Kit",
        image: "https://images.unsplash.com/photo-1611735341450-74d61e660ad2?auto=format&fit=crop&q=80",
        price: 8999,
        rentalPrice: 400,
        description: "Digital soil analysis kit with regional soil type database",
        category: "Tools",
        rating: 4.4,
        available: true,
        stock: 30,
        discount: 10,
        specifications: ["pH Testing", "NPK Analysis", "Mobile App", "Regional Database"]
    },
    {
        id: 5,
        name: "Polyhouse Control System",
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80",
        price: 65000,
        rentalPrice: 1200,
        description: "Automated polyhouse management system for Indian weather",
        category: "Technology",
        rating: 4.7,
        available: true,
        stock: 15,
        featured: true,
        specifications: ["Temperature Control", "Humidity Control", "Solar Powered", "Mobile Alerts"]
    },
    {
        id: 6,
        name: "Vermicompost Bundle",
        image: "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80",
        price: 3499,
        rentalPrice: 100,
        description: "Premium organic vermicompost for all Indian crops",
        category: "Chemicals",
        rating: 4.5,
        available: true,
        stock: 100,
        discount: 27,
        specifications: ["100% Organic", "Rich in Nutrients", "Local Earthworms", "No Chemicals"]
    }
]

const ProductCard = ({ product, index }: { product: Product; index: number }) => {
    const handlePayment = async () => {
        try {
            logPaymentFlow('Initializing Payment', {
                productName: product.name,
                amount: 1
            });

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: 100, // ₹1 in paise
                currency: "INR",
                name: "Krishi Tech",
                description: `Test Payment for: ${product.name}`,
                image: product.image,
                handler: function (response: any) {
                    logPaymentFlow('Payment Success', {
                        paymentId: response.razorpay_payment_id,
                        orderId: response.razorpay_order_id,
                        signature: response.razorpay_signature
                    });
                    // Here you would typically verify the payment on your backend
                    alert('Payment Successful! Order will be processed shortly.');
                },
                prefill: {
                    name: "Test User",
                    email: "test@example.com",
                    contact: "9999999999"
                },
                notes: {
                    productId: product.id,
                    category: product.category
                },
                theme: {
                    color: "#6366F1"
                }
            };

            const razorpay = new (window as any).Razorpay(options);

            razorpay.on('payment.failed', function (response: any) {
                logPaymentFlow('Payment Failed', response.error);
                alert('Payment failed. Please try again.');
            });

            logPaymentFlow('Opening Payment Modal');
            razorpay.open();

        } catch (error) {
            logPaymentFlow('Payment Error', {
                error: error instanceof Error ? error.message : 'Unknown error occurred',
                timestamp: new Date().toISOString()
            });
            alert('Something went wrong. Please try again later.');
        }
    };

    return (
        <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-50px" }}
            variants={{
                initial: { opacity: 0, y: 20 },
                animate: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                        delay: index * 0.1
                    }
                }
            }}
            whileHover={{ translateY: -4 }}
            className="flex overflow-hidden relative flex-col p-6 bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 hover:shadow-xl"
        >
            <div className="flex relative z-10 flex-col h-full">
                {/* Category & Rating */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-medium text-gray-500">{product.category}</span>
                    <div className="flex gap-1 items-center">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                    </div>
                </div>

                {/* Product Image */}
                <div className="overflow-hidden relative mb-6 w-full h-48 rounded-xl">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full"
                    />
                </div>

                {/* Title & Badges */}
                <div className="mb-4">
                    {(product.featured || product.discount) && (
                        <div className="flex gap-2 mb-2">
                            {product.featured && (
                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-primary-50 text-primary-600">
                                    Featured
                                </span>
                            )}
                            {product.discount && (
                                <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-rose-50 text-rose-600">
                                    {product.discount}% OFF
                                </span>
                            )}
                        </div>
                    )}
                    <h3 className="text-xl font-semibold tracking-tight leading-tight text-gray-900">
                        {product.name}
                    </h3>
                </div>

                {/* Description */}
                <p className="mb-8 text-gray-600 text-sm/relaxed">
                    {product.description}
                </p>

                {/* Specifications */}
                {product.specifications && (
                    <div className="flex flex-wrap gap-2 mb-8">
                        {product.specifications.map((spec, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full"
                            >
                                {spec}
                            </span>
                        ))}
                    </div>
                )}

                {/* Updated Pricing Display */}
                <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <span className="text-sm font-medium text-gray-600">Price</span>
                        <div className="text-right">
                            <span className="text-2xl font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
                        </div>
                    </div>
                    {product.rentalPrice > 0 && (
                        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <span className="text-sm font-medium text-gray-600">Rental Price</span>
                            <span className="text-xl font-semibold text-green-600">₹{product.rentalPrice} per Hour</span>
                        </div>
                    )}

                    {/* Updated Action Button */}
                    <motion.button
                        onClick={handlePayment}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="flex gap-2 justify-center items-center px-6 py-3 w-full font-medium text-white bg-green-600 rounded-xl transition-colors duration-200 hover:bg-green-700"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        Buy Now
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
};

const Market = () => {
    const [filter, setFilter] = useState<"all" | "buy" | "rent">("all");
    const [category, setCategory] = useState<string>("All");
    const [searchQuery, setSearchQuery] = useState("");
    const [sort, setSort] = useState<"price" | "rating" | "newest">("rating");
    const [isRazorpayReady, setIsRazorpayReady] = useState(false);

    useEffect(() => {
        try {
            checkRequiredEnvVars();
            if ((window as any).Razorpay) {
                setIsRazorpayReady(true);
                console.log('✅ Razorpay SDK loaded successfully');
            } else {
                throw new Error('Razorpay SDK not found');
            }
        } catch (error) {
            console.error('❌ Razorpay initialization failed:', error);
            setIsRazorpayReady(false);
        }
    }, []);

    const categories = ["All", "Heavy Equipment", "Technology", "Chemicals", "Tools", "Seeds", "Irrigation"];

    const filteredProducts = products
        .filter((product) => {
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesFilter =
                filter === "all" ||
                (filter === "buy" && product.price > 0) ||
                (filter === "rent" && product.rentalPrice > 0);
            const matchesCategory = category === "All" || product.category === category;

            return matchesSearch && matchesFilter && matchesCategory;
        })
        .sort((a, b) => {
            switch (sort) {
                case 'price': return a.price - b.price;
                case 'rating': return b.rating - a.rating;
                case 'newest': return b.id - a.id;
                default: return 0;
            }
        });

    return (
        <div className="py-12 bg-gradient-to-b from-gray-50 to-white sm:py-20">
            {!isRazorpayReady && (
                <div className="px-4 mx-auto mb-8 max-w-7xl">
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200">
                        <p className="text-yellow-800">
                            ⚠️ Payment system is not properly configured. Please check Razorpay setup.
                        </p>
                    </div>
                </div>
            )}

            <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-16 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block mb-4"
                    >
                        <span className="px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-sm font-medium">
                            Marketplace
                        </span>
                    </motion.div>
                    <h2 className="mb-4 text-4xl font-bold text-gray-900">
                        Smart Farming Marketplace
                    </h2>
                    <p className="mx-auto max-w-2xl text-lg text-gray-600">
                        Purchase or rent premium farming equipment and supplies
                    </p>
                </motion.div>

                {/* Updated Filters Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 space-y-6"
                >
                    {/* Search Bar */}
                    <div className="mx-auto w-full max-w-2xl">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="py-4 pr-4 pl-12 w-full text-base rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                        <select
                            className="px-6 py-3 text-gray-700 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>

                        <select
                            className="px-6 py-3 text-gray-700 bg-white rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500"
                            value={sort}
                            onChange={(e) => setSort(e.target.value as any)}
                        >
                            <option value="rating">Top Rated</option>
                            <option value="price">Price: Low to High</option>
                            <option value="newest">Newest First</option>
                        </select>

                        <div className="flex gap-3">
                            {["all", "buy", "rent"].map((type) => (
                                <button
                                    key={type}
                                    onClick={() => setFilter(type as "all" | "buy" | "rent")}
                                    className={`
                                        px-6 py-3 font-medium rounded-xl transition-all duration-200
                                        ${filter === type
                                            ? "bg-green-600 text-white"
                                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Responsive Products Grid */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 lg:gap-8">
                    {filteredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Market;
