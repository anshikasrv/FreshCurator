// 'use client';
// import React from 'react';
// import Link from 'next/link';

// export default function ShopHero() {
//   return (
//     <section className="mt-8 mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
//       <div className="lg:col-span-7 flex flex-col gap-6">
//         <span className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold w-fit tracking-wider font-label">SUMMER HARVEST 2026</span>
//         <h1 className="text-5xl md:text-7xl font-extrabold font-headline tracking-tighter leading-[0.95] text-on-surface">
//           Nature&rsquo;s Finest, <br />
//           <span className="text-primary italic">Delivered Fresh.</span>
//         </h1>
//         <p className="text-on-surface-variant text-lg max-w-lg leading-relaxed font-body">
//           Hand-picked organics from local farms, curated with precision. No middleman, no compromise—just soil-to-table excellence.
//         </p>
//         <div className="flex gap-4">
//           <button
//             onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
//             className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold font-headline transition-transform hover:scale-[1.02] flex items-center gap-2"
//           >
//             Shop Now
//             <span className="material-symbols-outlined">arrow_forward</span>
//           </button>
//           <Link href="/cart" className="bg-surface-container-lowest border border-outline-variant/10 text-on-surface px-8 py-4 rounded-xl font-bold font-headline hover:bg-surface-container-low transition-colors flex items-center gap-2">
//             <span className="material-symbols-outlined">shopping_basket</span>
//             My Basket
//           </Link>
//         </div>
//       </div>
//       <div className="lg:col-span-5 relative">
//         <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface-container shadow-2xl relative group">
//           <img
//             alt="Fresh vegetables"
//             className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
//             src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRpa9rx4vpLw3nO_RKjwgLatjBvfxtSeZ1MW4y8VGfZyq5fOFPaQGSbEXR-WiNCvn-Ue_S4oejhWiV-tn63ds3Dso6djSvTJ26_dE5xU9OTneEXqQ2w8KHdO7qxVItCgYLLE2r5CMc5fQFKivg_CsvdN8Bl14uYeesEFhu3SKli2P-sXG0HGtUDPOOUcJQTKXIJLsWWKSXzRZcoy_cF2ulfzSnSW5coRK2m51DFf7wnSMFFh1miigtOTmij-w-t9yV8Kw4mF-VHYiC"
//           />
//           <div className="absolute bottom-6 left-6 right-6 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/20">
//             <div className="flex justify-between items-center">
//               <div>
//                 <p className="text-xs font-bold text-primary font-label">FEATURED PRODUCER</p>
//                 <p className="text-sm font-bold text-on-surface font-headline">Green Valley Organics</p>
//               </div>
//               <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span>
//             </div>
//           </div>
//         </div>
//       </div>
//     </section>
//   );
// }

'use client';
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ShopHero() {
  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, // Time between each child animation
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } 
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 1.2, ease: "easeOut" } 
    },
  };

  return (
    <motion.section 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="mt-8 mb-16 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center"
    >
      {/* Left Column: Text Content */}
      <div className="lg:col-span-7 flex flex-col gap-6">
        <motion.span 
          variants={itemVariants}
          className="bg-primary/10 text-primary px-4 py-1.5 rounded-full text-xs font-bold w-fit tracking-wider font-label"
        >
          SUMMER HARVEST 2026
        </motion.span>

        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl font-extrabold font-headline tracking-tighter leading-[0.95] text-on-surface"
        >
          Nature’s Finest, <br />
          <motion.span 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 1 }}
            className="text-primary italic"
          >
            Delivered Fresh.
          </motion.span>
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-on-surface-variant text-lg max-w-lg leading-relaxed font-body"
        >
          Hand-picked organics from local farms, curated with precision. No middleman, no compromise—just soil-to-table excellence.
        </motion.p>

        <motion.div variants={itemVariants} className="flex gap-4">
          <button
            onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-gradient-to-br from-primary to-primary-container text-on-primary-container px-8 py-4 rounded-xl font-bold font-headline transition-transform hover:scale-[1.05] active:scale-95 flex items-center gap-2 shadow-lg shadow-primary/20"
          >
            Shop Now
            <motion.span 
              animate={{ x: [0, 5, 0] }} 
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="material-symbols-outlined"
            >
              arrow_forward
            </motion.span>
          </button>
          
          <Link href="/cart" className="bg-surface-container-lowest border border-outline-variant/10 text-on-surface px-8 py-4 rounded-xl font-bold font-headline hover:bg-surface-container-low transition-colors flex items-center gap-2 shadow-sm">
            <span className="material-symbols-outlined">shopping_basket</span>
            My Basket
          </Link>
        </motion.div>
      </div>

      {/* Right Column: Image Content */}
      <motion.div 
        variants={imageVariants}
        className="lg:col-span-5 relative"
      >
        <div className="aspect-[4/5] rounded-[2rem] overflow-hidden bg-surface-container shadow-2xl relative group">
          <motion.img
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.7 }}
            alt="Fresh vegetables"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCRpa9rx4vpLw3nO_RKjwgLatjBvfxtSeZ1MW4y8VGfZyq5fOFPaQGSbEXR-WiNCvn-Ue_S4oejhWiV-tn63ds3Dso6djSvTJ26_dE5xU9OTneEXqQ2w8KHdO7qxVItCgYLLE2r5CMc5fQFKivg_CsvdN8Bl14uYeesEFhu3SKli2P-sXG0HGtUDPOOUcJQTKXIJLsWWKSXzRZcoy_cF2ulfzSnSW5coRK2m51DFf7wnSMFFh1miigtOTmij-w-t9yV8Kw4mF-VHYiC"
          />
          
          {/* Floating Featured Badge */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="absolute bottom-6 left-6 right-6 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs font-bold text-primary font-label">FEATURED PRODUCER</p>
                <p className="text-sm font-bold text-on-surface font-headline">Green Valley Organics</p>
              </div>
              <motion.span 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="material-symbols-outlined text-primary" 
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                stars
              </motion.span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.section>
  );
}