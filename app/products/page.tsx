"use client";
import React, { useState, useMemo } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProductCard from '@/components/ProductCard/ProductCard';
import { products, categories, filterColors } from '@/lib/data';
import { SlidersHorizontal, ChevronDown, X, Star, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './ProductsPage.module.css';

export default function ProductsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<number>(500);
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('Newest');

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesColor = !selectedColor || product.colors.includes(selectedColor);
      const matchesPrice = product.price <= priceRange;
      const matchesRating = product.rating >= minRating;
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesColor && matchesPrice && matchesRating && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Rating') return b.rating - a.rating;
      return b.id - a.id; // Newest by default
    });
  }, [selectedCategory, selectedColor, priceRange, minRating, searchQuery, sortBy]);

  const resetFilters = () => {
    setSelectedCategory('All');
    setSelectedColor(null);
    setPriceRange(500);
    setMinRating(0);
    setSearchQuery('');
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        {/* Page Header */}
        <div className={styles.header}>
          <div className="container">
            <div className={styles.headerContent}>
              <h1 className="heading-lg">Our Collection</h1>
              <p>Explore our carefully curated selection of premium home essentials.</p>
            </div>
          </div>
        </div>

        <div className="container">
          <div className={styles.layout}>
            {/* Sidebar / Desktop Filters */}
            <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ''}`}>
               <div className={styles.sidebarHeader}>
                 <h3>Filters</h3>
                 <button onClick={() => setIsSidebarOpen(false)} className={styles.closeBtn} aria-label="Close filters">
                   <X size={20} />
                 </button>
               </div>

               <div className={styles.filterSection}>
                  <h4>Search</h4>
                  <div className={styles.searchBox}>
                    <Search size={18} />
                    <input 
                      type="text" 
                      placeholder="Search products..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
               </div>

               <div className={styles.filterSection}>
                  <h4>Categories</h4>
                  <div className={styles.categoryList}>
                    <button 
                      className={selectedCategory === 'All' ? styles.active : ''}
                      onClick={() => setSelectedCategory('All')}
                    >
                      All Products
                    </button>
                    {categories.map(cat => (
                      <button 
                        key={cat.id} 
                        className={selectedCategory === cat.name ? styles.active : ''}
                        onClick={() => setSelectedCategory(cat.name)}
                      >
                        {cat.name} <span>({cat.count})</span>
                      </button>
                    ))}
                  </div>
               </div>

               <div className={styles.filterSection}>
                  <h4>Price Range</h4>
                  <div className={styles.priceFilter}>
                     <input 
                       type="range" 
                       min="0" 
                       max="1000" 
                       step="10"
                       value={priceRange}
                       onChange={(e) => setPriceRange(parseInt(e.target.value))}
                     />
                     <div className={styles.priceLabels}>
                       <span>$0</span>
                       <span>Current: ${priceRange}</span>
                     </div>
                  </div>
               </div>

               <div className={styles.filterSection}>
                  <h4>Colors</h4>
                  <div className={styles.colorGrid}>
                    {filterColors.map(color => (
                      <button 
                        key={color.name}
                        className={`${styles.colorBtn} ${selectedColor === color.hex ? styles.colorActive : ''}`}
                        style={{ '--color-hex': color.hex } as React.CSSProperties}
                        onClick={() => setSelectedColor(selectedColor === color.hex ? null : color.hex)}
                        title={color.name}
                      />
                    ))}
                  </div>
               </div>

               <div className={styles.filterSection}>
                  <h4>Minimum Rating</h4>
                  <div className={styles.ratingFilter}>
                    {[4, 3, 2, 1].map(rating => (
                      <button 
                        key={rating}
                        className={minRating === rating ? styles.active : ''}
                        onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                      >
                        <div className={styles.stars}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star 
                              key={i} 
                              size={14} 
                              fill={i < rating ? "var(--accent)" : "none"} 
                              stroke={i < rating ? "none" : "var(--fg-subtle)"} 
                            />
                          ))}
                        </div>
                        <span>& Up</span>
                      </button>
                    ))}
                  </div>
               </div>

               <button className={styles.resetBtn} onClick={resetFilters}>
                 Clear All Filters
               </button>
            </aside>

            {/* Results Area */}
            <div className={styles.content}>
               <div className={styles.toolbar}>
                  <div className={styles.resultsCount}>
                    Showing <span>{filteredProducts.length}</span> products
                  </div>
                  
                  <div className={styles.actions}>
                    <button className={styles.mobileFilterBtn} onClick={() => setIsSidebarOpen(true)}>
                      <SlidersHorizontal size={18} />
                      Filters
                    </button>

                    <div className={styles.sort}>
                      <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                        <option>Newest</option>
                        <option>Price: Low to High</option>
                        <option>Price: High to Low</option>
                        <option>Rating</option>
                      </select>
                    </div>
                  </div>
               </div>

               {filteredProducts.length > 0 ? (
                 <div className={styles.grid}>
                    <AnimatePresence>
                      {filteredProducts.map((product, index) => (
                        <ProductCard key={product.id} product={product} index={index % 8} />
                      ))}
                    </AnimatePresence>
                 </div>
               ) : (
                 <div className={styles.noResults}>
                    <h3>No products found</h3>
                    <p>Try adjusting your filters or search terms.</p>
                    <button className="btn btn-accent btn-sm" onClick={resetFilters}>Clear Filters</button>
                 </div>
               )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            className={styles.overlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
