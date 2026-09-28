"use client";

import { useEffect, useState } from "react";
import { FaWhatsapp } from "react-icons/fa";

interface FloatingWhatsAppProps {
  phone?: string | null;
}

export default function FloatingWhatsApp({
  phone,
}: FloatingWhatsAppProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 300);
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  if (!phone) return null;

  const whatsappNumber = phone.replace(/\D/g, "");
const message =
  "Hi Vaishnavi Collections! I have a query regarding your products. Could you please help me?";

const whatsappUrl = `https://wa.me/91${whatsappNumber}?text=${encodeURIComponent(
  message
)}`;
  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with Vaishnavi Collections on WhatsApp"
  className={`
  fixed
  left-5
  bottom-5
  z-50
  flex
  h-14
  w-14
  items-center
  justify-center
  rounded-full
  border-2
  border-[#D4AF37]
  bg-[#071A35]
  text-[#D4AF37]
  shadow-xl
  shadow-black/20
  transition-all
  duration-300
  hover:scale-110
  hover:bg-[#D4AF37]
  hover:text-[#071A35]
  ${
    visible
      ? "translate-y-0 opacity-100"
      : "translate-y-4 opacity-0 pointer-events-none"
  }
`}
    >
      <FaWhatsapp size={26} />
    </a>
  );
}