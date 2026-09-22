"use client";
import React, { useState } from 'react';
import Navbar from '@/components/Navbar/Navbar';
import Footer from '@/components/Footer/Footer';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, MessageCircle } from 'lucide-react';
import styles from './ContactPage.module.css';

export default function ContactPage() {
  const [formStatus, setFormStatus] = useState<null | 'sending' | 'sent'>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus('sending');
    setTimeout(() => setFormStatus('sent'), 1500);
  };

  return (
    <>
      <Navbar />
      <main className={styles.main}>
        <section className={styles.hero}>
          <div className="container">
            <div className={styles.heroContent}>
              <h1 className="heading-lg">Get in touch.</h1>
              <p>Have a question or looking for styling advice? Our team is here to help.</p>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className={styles.grid}>
              {/* Form Side */}
              <motion.div 
                className={styles.formCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h3>Send us a message</h3>
                <form onSubmit={handleSubmit} className={styles.form}>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="name">Full Name</label>
                      <input type="text" id="name" placeholder="John Doe" required />
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="email">Email Address</label>
                      <input type="email" id="email" placeholder="john@example.com" required />
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="subject">Subject</label>
                    <select id="subject">
                      <option>General Inquiry</option>
                      <option>Order Support</option>
                      <option>Interior Styling Advice</option>
                      <option>Returns & Exchanges</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="message">Message</label>
                    <textarea id="message" rows={5} placeholder="How can we help you?" required></textarea>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-accent btn-lg"
                    disabled={formStatus !== null}
                  >
                    {formStatus === 'sent' ? 'Message Sent!' : formStatus === 'sending' ? 'Sending...' : (
                      <>
                        Send Message
                        <Send size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>

              {/* Info Side */}
              <motion.div 
                className={styles.infoCol}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className={styles.infoCard}>
                   <div className={styles.iconBox}><Mail size={24} /></div>
                   <div className={styles.infoText}>
                     <h4>Email Us</h4>
                     <p>hello@Vaishnavi Collections.com</p>
                     <span>Average response: 2 hours</span>
                   </div>
                </div>
                <div className={styles.infoCard}>
                   <div className={styles.iconBox}><Phone size={24} /></div>
                   <div className={styles.infoText}>
                     <h4>Call Us</h4>
                     <p>+1 (555) 000-LUMI</p>
                     <span>Mon-Fri · 9am - 6pm EST</span>
                   </div>
                </div>
                <div className={styles.infoCard}>
                   <div className={styles.iconBox}><MapPin size={24} /></div>
                   <div className={styles.infoText}>
                     <h4>Visit Studio</h4>
                     <p>245 Design District, New York, NY</p>
                     <span>By appointment only</span>
                   </div>
                </div>

                <div className={styles.liveChat}>
                   <div className={styles.chatIcon}><MessageCircle size={24} /></div>
                   <div>
                     <h4>Need immediate help?</h4>
                     <p>Chat with a stylist live on the website.</p>
                     <button className={styles.chatBtn}>Start Live Chat</button>
                   </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* FAQ Preview or Map could go here */}
      </main>
      <Footer />
    </>
  );
}
