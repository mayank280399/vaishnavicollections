import { ArrowUpRight, Sparkles } from "lucide-react";

type ContactData = {
  whatsapp: string;
  madeToOrderMessage: string;
};

interface ContactHelpProps {
  data: ContactData;
}

export default function ContactHelp({
  data,
}: ContactHelpProps) {
  const whatsappNumber = data.whatsapp.replace(/\D/g, "");

  const whatsappUrl = whatsappNumber
    ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        "Hi Vaishnavi Collections, I would like to ask about a product."
      )}`
    : "";

  return (
    <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[2rem] bg-[#F8F6F1]">
        <div className="relative p-7 sm:p-10 lg:p-12">
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full border border-[#C9A227]/20" />

          <div className="relative flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0B1F3A] text-[#C9A227]">
                <Sparkles size={20} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C9A227]">
                  Looking For Something Specific?
                </p>

                <h2 className="mt-2 max-w-xl font-serif text-2xl text-[#0B1F3A] sm:text-3xl">
                  Just send us a message.
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-[#0B1F3A]/60">
                  {data.madeToOrderMessage}
                </p>
              </div>
            </div>

            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#0B1F3A] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:bg-[#132B4D]"
              >
                Ask On WhatsApp
                <ArrowUpRight size={15} />
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}