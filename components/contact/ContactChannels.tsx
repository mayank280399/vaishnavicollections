"use client";

import { ArrowUpRight, MessageCircle, Phone } from "lucide-react";
import { FaInstagram } from "react-icons/fa";

type ContactData = {
    phone: string;
    whatsapp: string;
    instagram: string;
};

interface ContactChannelsProps {
    data: ContactData;
}

export default function ContactChannels({
    data,
}: ContactChannelsProps) {
    const whatsappNumber = data.whatsapp.replace(/\D/g, "");

    const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber}`
        : "";

    const phoneUrl = data.phone
        ? `tel:${data.phone.replace(/\s+/g, "")}`
        : "";

    const channels = [
        {
            eyebrow: "Quickest Way",
            title: "WhatsApp Us",
            description:
                "Ask about product availability, prices, sizes, photos, orders or anything you're looking for.",
            action: "Start a conversation",
            href: whatsappUrl,
            icon: MessageCircle,
            featured: true,
        },
        {
            eyebrow: "Prefer To Talk?",
            title: "Call Us",
            description:
                "Have a question or need help choosing something? Give us a call and talk to us directly.",
            action: "Call Vaishnavi Collections",
            href: phoneUrl,
            icon: Phone,
            featured: false,
        },
        {
            eyebrow: "See What’s New",
            title: "Instagram",
            description:
                "Follow us for new products, Laddu Gopal poshak, accessories, home decor and more.",
            action: "Visit our Instagram",
            href: data.instagram,
            icon: FaInstagram,
            featured: false,
        },
    ];

    return (
        <section className="bg-[#F8F6F1] px-5 py-14 sm:px-8 sm:py-20 lg:px-10 lg:py-24">
            <div className="mx-auto max-w-6xl">
                <div className="mx-auto max-w-2xl text-center">
                    <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
                        Let&apos;s Connect
                    </p>

                    <h2 className="mt-4 font-serif text-3xl leading-tight text-[#0B1F3A] sm:text-4xl lg:text-5xl">
                        The easiest way to reach us is simply to talk.
                    </h2>

                    <p className="mt-5 text-sm leading-7 text-[#0B1F3A]/60 sm:text-base">
                        Whether you want to check something before visiting, ask
                        about a product or place an order, connect with us directly.
                    </p>
                </div>

                <div className="mt-12 grid gap-5 lg:grid-cols-3">
                    {channels.map((channel) => {
                        const Icon = channel.icon;

                        const card = (
                            <div
                                className={`group relative h-full overflow-hidden rounded-[2rem] border p-7 transition-all duration-300 sm:p-8 ${channel.featured
                                        ? "border-[#C9A227]/40 bg-[#0B1F3A] text-white shadow-xl shadow-[#0B1F3A]/10"
                                        : "border-[#0B1F3A]/10 bg-white hover:-translate-y-1 hover:border-[#C9A227]/40 hover:shadow-xl"
                                    }`}
                            >
                                {channel.featured && (
                                    <div className="absolute right-6 top-6 rounded-full bg-[#C9A227] px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.15em] text-[#0B1F3A]">
                                        Recommended
                                    </div>
                                )}

                                <div
                                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${channel.featured
                                            ? "bg-[#C9A227] text-[#0B1F3A]"
                                            : "bg-[#0B1F3A] text-[#C9A227]"
                                        }`}
                                >
                                    <Icon
                                        size={24}
                                        strokeWidth={
                                            channel.icon === FaInstagram ? undefined : 1.7
                                        }
                                    />
                                </div>

                                <p
                                    className={`mt-7 text-[10px] font-bold uppercase tracking-[0.2em] ${channel.featured
                                            ? "text-[#C9A227]"
                                            : "text-[#C9A227]"
                                        }`}
                                >
                                    {channel.eyebrow}
                                </p>

                                <h3
                                    className={`mt-2 font-serif text-2xl sm:text-3xl ${channel.featured
                                            ? "text-white"
                                            : "text-[#0B1F3A]"
                                        }`}
                                >
                                    {channel.title}
                                </h3>

                                <p
                                    className={`mt-4 text-sm leading-7 ${channel.featured
                                            ? "text-white/60"
                                            : "text-[#0B1F3A]/55"
                                        }`}
                                >
                                    {channel.description}
                                </p>

                                {channel.href ? (
                                    <div
                                        className={`mt-7 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] ${channel.featured
                                                ? "text-[#C9A227]"
                                                : "text-[#0B1F3A]"
                                            }`}
                                    >
                                        {channel.action}
                                        <ArrowUpRight
                                            size={15}
                                            className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                                        />
                                    </div>
                                ) : (
                                    <div className="mt-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#0B1F3A]/30">
                                        Contact details coming soon
                                    </div>
                                )}
                            </div>
                        );

                        if (!channel.href) {
                            return (
                                <div key={channel.title}>
                                    {card}
                                </div>
                            );
                        }

                        return (
                            <a
                                key={channel.title}
                                href={channel.href}
                                target={
                                    channel.title === "Call Us"
                                        ? undefined
                                        : "_blank"
                                }
                                rel={
                                    channel.title === "Call Us"
                                        ? undefined
                                        : "noopener noreferrer"
                                }
                            >
                                {card}
                            </a>
                        );
                    })}
                </div>

                <div className="mt-8 text-center">
                    <p className="text-xs text-[#0B1F3A]/45">
                        Product enquiry? Send us a message on WhatsApp with a photo
                        or description of what you&apos;re looking for.
                    </p>
                </div>
            </div>
        </section>
    );
}