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
        name: "Smart Drip Irrigation Kit",
        image: "https://images.unsplash.com/photo-1591154669695-5f2a8d20c089?auto=format&fit=crop&q=80",
        price: 5000,
        rentalPrice: 800,
        description: "Advanced water-efficient drip irrigation system with smart controls, perfect for Indian farming conditions. Includes automated scheduling and mobile monitoring.",
        category: "Irrigation",
        rating: 4.7,
        available: true,
        stock: 20,
        featured: true,
        specifications: [
            "Water-saving Technology",
            "Smart Controls",
            "Weather-resistant",
            "1 Acre Coverage"
        ]
    },
    {
        id: 2,
        name: "Premium Seeds Collection",
        image: "https://images.unsplash.com/photo-1500651230702-0e2d8a49d4ad?auto=format&fit=crop&q=80",
        price: 4999,
        rentalPrice: 0,
        description: "Comprehensive collection of premium indigenous seed varieties, specially selected for Indian farming conditions. Includes major crop varieties with high yield potential.",
        category: "Seeds",
        rating: 4.6,
        available: true,
        stock: 75,
        discount: 16,
        specifications: [
            "Indigenous Varieties",
            "High-yield Strains",
            "Drought-resistant",
            "Non-GMO Certified"
        ]
    },
    {
        id: 3,
        name: "Kisan Pro Sprayer Drone",
        image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&q=80",
        price: 50000,
        rentalPrice: 2500,
        description: "Professional-grade agricultural drone with advanced spraying capabilities. Features precision controls, HD camera, and intelligent flight planning for efficient crop management.",
        category: "Technology",
        rating: 4.9,
        available: true,
        stock: 8,
        featured: true,
        specifications: [
            "4K HD Camera",
            "25min Flight Time",
            "GPS Navigation",
            "10L Tank Capacity"
        ]
    },
    {
        id: 4,
        name: "Digital Soil Analysis Kit",
        image: "https://images.unsplash.com/photo-1611735341450-74d61e660ad2?auto=format&fit=crop&q=80",
        price: 8999,
        rentalPrice: 400,
        description: "Professional digital soil testing kit with comprehensive analysis capabilities. Includes mobile app integration and access to regional soil type database for accurate results.",
        category: "Tools",
        rating: 4.4,
        available: true,
        stock: 30,
        discount: 10,
        specifications: [
            "pH Testing System",
            "NPK Analysis",
            "Mobile App Sync",
            "Regional Database"
        ]
    },
    {
        id: 5,
        name: "Smart Polyhouse System",
        image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&q=80",
        price: 65000,
        rentalPrice: 1200,
        description: "Automated polyhouse management system designed for Indian weather conditions. Features smart climate control, remote monitoring, and integrated pest management system.",
        category: "Technology",
        rating: 4.7,
        available: true,
        stock: 15,
        featured: true,
        specifications: [
            "Climate Control",
            "Remote Monitoring",
            "Solar Powered",
            "Mobile Alerts"
        ]
    },
    {
        id: 6,
        name: "Organic Farming Bundle",
        image: "https://images.unsplash.com/photo-1515150144380-bca9f1650ed9?auto=format&fit=crop&q=80",
        price: 3499,
        rentalPrice: 100,
        description: "Complete organic farming starter kit including premium vermicompost, organic pesticides, and bio-fertilizers. Perfect for sustainable agriculture practices.",
        category: "Organic",
        rating: 4.5,
        available: true,
        stock: 100,
        discount: 27,
        specifications: [
            "Organic Certified",
            "Bio Fertilizers",
            "Natural Pesticides",
            "Soil Enhancers"
        ]
    }
];

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
            viewport={{ once: true, margin: "-20px" }}
            variants={{
                initial: { opacity: 0, y: 20 },
                animate: {
                    opacity: 1,
                    y: 0,
                    transition: {
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                        delay: index * 0.1
                    }
                }
            }}
            className="relative h-full group"
        >
            <motion.div
                className="absolute inset-0 bg-gradient-to-br to-emerald-100 rounded-2xl opacity-0 blur-xl transition-all duration-300 from-primary-100 group-hover:opacity-70"
                initial={{ scale: 0.8 }}
            />
            <div className="flex overflow-hidden relative flex-col p-6 h-full bg-white rounded-2xl border border-gray-200 shadow-sm transition-all duration-300 group-hover:shadow-xl group-hover:border-gray-300">
                {/* Category & Rating */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-sm font-medium text-gray-500">{product.category}</span>
                    <div className="flex gap-1 items-center px-3 py-1 rounded-full border border-gray-100 backdrop-blur bg-white/90">
                        <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-medium text-gray-700">{product.rating}</span>
                    </div>
                </div>

                {/* Product Image */}
                <div className="overflow-hidden relative mb-6 w-full h-48 bg-gray-50 rounded-xl">
                    <img
                        src={product.image}
                        alt={product.name}
                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                    />
                    {/* Badges */}
                    {(product.featured || product.discount) && (
                        <div className="flex absolute top-4 left-4 gap-2">
                            {product.featured && (
                                <span className="px-3 py-1 text-xs font-medium rounded-full border backdrop-blur-sm bg-primary-50/90 text-primary-600 border-primary-100/50">
                                    Featured
                                </span>
                            )}
                            {product.discount && (
                                <span className="px-3 py-1 text-xs font-medium text-rose-600 rounded-full border backdrop-blur-sm bg-rose-50/90 border-rose-100/50">
                                    {product.discount}% OFF
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Content Container */}
                <div className="flex flex-col flex-grow">
                    {/* Title */}
                    <h3 className="mb-4 text-xl font-semibold tracking-tight leading-tight text-gray-900 line-clamp-2 min-h-[3.5rem]">
                        {product.name}
                    </h3>

                    {/* Description */}
                    <p className="mb-6 text-gray-600 text-sm/relaxed line-clamp-3 min-h-[4.5rem]">
                        {product.description}
                    </p>

                    {/* Specifications */}
                    <div className="flex flex-wrap gap-2 mb-8 min-h-[4rem]">
                        {product.specifications?.map((spec, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-50 rounded-full border border-gray-100"
                            >
                                {spec}
                            </span>
                        ))}
                    </div>

                    {/* Pricing Section */}
                    <div className="mt-auto space-y-4">
                        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                            <span className="text-sm font-medium text-gray-600">Price</span>
                            <div className="text-right">
                                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r to-emerald-600 from-primary-600">
                                    ₹{product.price.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        {product.rentalPrice > 0 && (
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <span className="text-sm font-medium text-gray-600">Rental Price</span>
                                <span className="text-xl font-semibold text-emerald-600">
                                    ₹{product.rentalPrice} per Hour
                                </span>
                            </div>
                        )}

                        {/* Action Button */}
                        <motion.button
                            onClick={handlePayment}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex relative gap-2 justify-center items-center px-6 py-3 w-full font-medium text-white rounded-xl shadow-lg transition-all duration-300 group/btn bg-primary-600 hover:bg-primary-700 shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/30"
                        >
                            <motion.div
                                className="absolute inset-0 rounded-xl opacity-0 blur-lg transition-opacity duration-300 bg-primary-400 group-hover/btn:opacity-30"
                                initial={{ scale: 0.8 }}
                            />
                            <ShoppingCart className="relative w-5 h-5" />
                            <span className="relative">Buy Now</span>
                        </motion.button>
                    </div>
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
        <section className="overflow-hidden relative bg-gradient-to-b from-white to-gray-50">
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
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="mb-12 text-center"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5 }}
                        className="inline-block mb-4"
                    >
                        <div className="inline-flex gap-2 items-center px-5 py-2 text-sm font-medium bg-gradient-to-r to-emerald-50 rounded-full transition-colors duration-300 from-primary-50 text-primary-900 hover:to-emerald-100 hover:from-primary-100">
                            <ShoppingCart className="w-4 h-4 text-primary-500" />
                            <span className="text-xs font-semibold tracking-wide text-transparent uppercase bg-clip-text bg-gradient-to-r to-emerald-700 from-primary-700">
                                Premium Equipment
                            </span>
                        </div>
                    </motion.div>
                    <h2 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
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
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="mb-12 space-y-6"
                >
                    {/* Search Bar */}
                    <div className="mx-auto w-full max-w-2xl">
                        <div className="relative group">
                            <motion.div
                                className="absolute inset-0 rounded-xl opacity-20 blur-xl transition-all duration-300 bg-primary-500 group-hover:opacity-30"
                                initial={{ scale: 0.8 }}
                            />
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 w-5 h-5 text-gray-400 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search products..."
                                    className="py-4 pr-4 pl-12 w-full text-base rounded-xl border border-gray-200 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Filter Controls */}
                    <div className="flex flex-wrap gap-4 justify-center items-center">
                        <motion.select
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </motion.select>

                        <motion.select
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 text-gray-700 bg-white rounded-xl border border-gray-200 shadow-sm transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            value={sort}
                            onChange={(e) => setSort(e.target.value as any)}
                        >
                            <option value="rating">Top Rated</option>
                            <option value="price">Price: Low to High</option>
                            <option value="newest">Newest First</option>
                        </motion.select>

                        <div className="flex gap-3">
                            {["all", "buy", "rent"].map((type) => (
                                <motion.button
                                    key={type}
                                    onClick={() => setFilter(type as "all" | "buy" | "rent")}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`
                                        relative px-6 py-3 font-medium rounded-xl shadow-sm transition-all duration-300
                                        ${filter === type
                                            ? "bg-primary-600 text-white hover:bg-primary-700"
                                            : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                                        }
                                    `}
                                >
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Products Grid with Updated Spacing */}
                <div className="grid grid-cols-1 gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3 sm:gap-8 lg:gap-10">
                    {filteredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index} />
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Market;