import {
  Mail,
  MessageCircle,
  Phone,
} from "lucide-react";
import { FaInstagram } from "react-icons/fa";

type ContactData = {
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
};

interface ContactInfoProps {
  data: ContactData;
}

export default function ContactInfo({
  data,
}: ContactInfoProps) {
  const items = [
    {
      title: "Call Us",
      description: "Speak with us about products and orders.",
      value: data.phone,
      href: data.phone
        ? `tel:${data.phone.replace(/\s+/g, "")}`
        : undefined,
      icon: Phone,
    },
    {
      title: "WhatsApp",
      description: "Send us your requirement or enquiry.",
      value: data.whatsapp,
      href: data.whatsapp
        ? `https://wa.me/${data.whatsapp.replace(/\D/g, "")}`
        : undefined,
      icon: MessageCircle,
    },
    {
      title: "Email Us",
      description: "For general enquiries and assistance.",
      value: data.email,
      href: data.email
        ? `mailto:${data.email}`
        : undefined,
      icon: Mail,
    },
    {
      title: "Instagram",
      description: "Follow us for products and updates.",
      value: data.instagram
        ? "Visit our Instagram"
        : "",
      href: data.instagram || undefined,
      icon: FaInstagram,
    },
  ];

  return (
    <section className="bg-[#F8F6F1] px-5 py-14 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;

          const content = (
            <div className="h-full rounded-[1.5rem] border border-[#0B1F3A]/10 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#C9A227]/40 hover:shadow-lg">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0B1F3A] text-[#C9A227]">
                <Icon size={19} strokeWidth={1.7} />
              </div>

              <h2 className="mt-6 font-serif text-xl text-[#0B1F3A]">
                {item.title}
              </h2>

              <p className="mt-2 text-sm leading-6 text-[#0B1F3A]/55">
                {item.description}
              </p>

              {item.value && (
                <p className="mt-5 break-words text-sm font-semibold text-[#0B1F3A]">
                  {item.value}
                </p>
              )}
            </div>
          );

          return item.href ? (
            <a
              key={item.title}
              href={item.href}
              target={
                item.title === "Instagram" ||
                item.title === "WhatsApp"
                  ? "_blank"
                  : undefined
              }
              rel={
                item.title === "Instagram" ||
                item.title === "WhatsApp"
                  ? "noopener noreferrer"
                  : undefined
              }
            >
              {content}
            </a>
          ) : (
            <div key={item.title}>{content}</div>
          );
        })}
      </div>
    </section>
  );
}