"use client";
import React, { useState, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  Minus, 
  Plus, 
  Heart, 
  Share2, 
  ShieldCheck, 
  Truck, 
  RotateCcw,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { products } from '@/lib/data';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import ProductCard from '@/components/ProductCard/ProductCard';
import styles from './ProductPage.module.css';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const productId = parseInt(resolvedParams.id);
  const product = products.find(p => p.id === productId);

  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(product?.colors[0]);
  const [activeTab, setActiveTab] = useState('details');
  const [activeImage, setActiveImage] = useState(product?.image || '');

  if (!product) {
    return (
      <>
        <Navbar />
        <div className="container" style={{ padding: '200px 0', textAlign: 'center' }}>
          <h1 className="heading-lg">Product Not Found</h1>
          <Link href="/products" className="btn btn-primary" style={{ marginTop: '24px' }}>
            Back to Shop
          </Link>
        </div>
        <Footer />
      </>
    );
  }

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  // Gallery items - current products have 1 image, so we just show one thumbnail
  const galleryImages = [product.image];

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.productSection}>
          <div className="container">
            <div className={styles.layout}>
              {/* Left: Gallery */}
              <motion.div 
                className={styles.gallery}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles.mainImageContainer}>
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeImage}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ position: 'relative', width: '100%', height: '100%' }}
                    >
                      <Image 
                        src={activeImage} 
                        alt={product.name} 
                        fill 
                        className={styles.mainImage}
                        priority
                        sizes="(max-width: 1024px) 100vw, 60vw"
                      />
                    </motion.div>
                  </AnimatePresence>
                  
                  {product.badge && (
                    <span 
                      className="product-badge" 
                      style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        left: '20px',
                        zIndex: 10,
                        pointerEvents: 'none'
                      }}
                    >
                      {product.badge}
                    </span>
                  )}
                </div>
                
                <div className={styles.thumbnails}>
                  {galleryImages.map((img, i) => (
                    <button 
                      key={i} 
                      className={`${styles.thumb} ${activeImage === img ? styles.active : ''}`}
                      onClick={() => setActiveImage(img)}
                    >
                      <Image src={img} alt={`${product.name} view ${i + 1}`} fill style={{ objectFit: 'cover' }} />
                    </button>
                  ))}
                </div>
              </motion.div>

              {/* Right: Info */}
              <motion.div 
                className={styles.info}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles.header}>
                  <span className={styles.category}>{product.category}</span>
                  <h1 className={styles.title}>{product.name}</h1>
                  <div className={styles.meta}>
                    <div className={styles.rating}>
                      <Star size={16} fill="var(--accent)" stroke="none" />
                      <span>{product.rating}</span>
                    </div>
                    <span className={styles.reviewCount}>({product.reviewCount} customer reviews)</span>
                  </div>
                </div>

                <div className={styles.priceRow}>
                  <span className={styles.price}>${product.price}</span>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>${product.originalPrice}</span>
                  )}
                </div>

                <p className={styles.desc}>{product.description}</p>

                <div className={styles.options}>
                  <div>
                    <span className={styles.optionLabel}>Color Selection</span>
                    <div className={styles.colorList}>
                      {product.colors.map((color, i) => (
                        <button
                          key={i}
                          className={`${styles.colorBtn} ${selectedColor === color ? styles.active : ''}`}
                          onClick={() => setSelectedColor(color)}
                          title={color}
                        >
                          <div className={styles.colorInner} style={{ background: color }} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className={styles.actions}>
                    <div className={styles.quantity}>
                      <button 
                        className={styles.qtyBtn} 
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus size={18} />
                      </button>
                      <span className={styles.qtyValue}>{quantity}</span>
                      <button 
                        className={styles.qtyBtn} 
                        onClick={() => setQuantity(quantity + 1)}
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                    <button className="btn btn-primary btn-lg styles.addBtn">
                      Add to Cart
                    </button>
                    <button className="btn btn-white btn-lg" style={{ minWidth: 'auto', padding: '0 18px' }}>
                      <Heart size={20} />
                    </button>
                  </div>
                </div>

                {/* Trust Badges */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <Truck size={20} className="text-accent" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>Free Express Delivery</span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <RotateCcw size={20} className="text-accent" />
                    <span style={{ fontSize: '13px', fontWeight: 600 }}>30-Day Free Returns</span>
                  </div>
                </div>

                {/* Extra Info Tabs */}
                <div className={styles.extra}>
                  <div className={styles.tabList}>
                    {['Details', 'Specifications', 'Shipping'].map((tab) => (
                      <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab.toLowerCase() ? styles.active : ''}`}
                        onClick={() => setActiveTab(tab.toLowerCase())}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  <div className={styles.tabContent}>
                    <AnimatePresence mode="wait">
                      {activeTab === 'details' && (
                        <motion.div
                          key="details"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          <p>Crafted with the finest materials and an unwavering commitment to quality. Every Vaishnavi Collections piece is a testament to timeless design and modern functionality.</p>
                          <ul style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {product.tags.map(tag => (
                              <li key={tag} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--accent)' }} />
                                {tag.charAt(0).toUpperCase() + tag.slice(1)} quality construction
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                      {activeTab === 'specifications' && (
                        <motion.div
                          key="specs"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className={styles.specsGrid}
                        >
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Materials</span>
                            <span className={styles.specValue}>Premium grade materials</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Dimensions</span>
                            <span className={styles.specValue}>H: 120cm, W: 60cm, D: 60cm</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Weight</span>
                            <span className={styles.specValue}>12.5 kg</span>
                          </div>
                          <div className={styles.specItem}>
                            <span className={styles.specLabel}>Assembly</span>
                            <span className={styles.specValue}>Minimal assembly required</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className={`section ${styles.related}`}>
            <div className="container">
              <div className="section-header">
                <h2 className="heading-md">Complete the Look</h2>
                <p>Designed to pair perfectly with your transition.</p>
              </div>
              <div className={styles.relatedGrid}>
                {relatedProducts.map(rp => (
                  <ProductCard key={rp.id} product={rp} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
