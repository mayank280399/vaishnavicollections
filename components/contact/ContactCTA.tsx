import { ArrowUpRight } from "lucide-react";

type ContactData = {
  phone: string;
  whatsapp: string;
};

interface ContactCTAProps {
  data: ContactData;
}

export default function ContactCTA({
  data,
}: ContactCTAProps) {
  const phoneUrl = data.phone
    ? `tel:${data.phone.replace(/\s+/g, "")}`
    : "";

  const whatsappNumber = data.whatsapp.replace(/\D/g, "");

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "";

  return (
    <section className="bg-[#0B1F3A] px-5 py-20 text-center text-white sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
          Vaishnavi Collections
        </p>

        <h2 className="mt-4 font-serif text-4xl leading-tight sm:text-5xl">
          We&apos;re just a message away.
        </h2>

        <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/60 sm:text-base">
          Whether you&apos;re looking for something specific, checking
          availability or simply want to know more, feel free to reach
          out.
        </p>

        <div className="mt-9 flex flex-wrap justify-center gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#C9A227] px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-[#0B1F3A] transition hover:bg-[#D8B63B]"
            >
              WhatsApp Us
              <ArrowUpRight size={15} />
            </a>
          )}

          {phoneUrl && (
            <a
              href={phoneUrl}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-xs font-bold uppercase tracking-[0.16em] text-white transition hover:border-[#C9A227] hover:text-[#C9A227]"
            >
              Call Us
              <ArrowUpRight size={15} />
            </a>
          )}
        </div>
      </div>
    </section>
  );
}