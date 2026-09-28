type ContactData = {
  businessName: string;
};

interface ContactHeroProps {
  data: ContactData;
}

export default function ContactHero({
  data,
}: ContactHeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#0B1F3A] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-10 lg:py-28">
      <div className="absolute -right-32 -top-32 h-80 w-80 rounded-full border border-[#C9A227]/15" />
      <div className="absolute -bottom-40 -left-32 h-96 w-96 rounded-full border border-[#C9A227]/10" />

      <div className="relative mx-auto max-w-6xl">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">
            Contact {data.businessName}
          </p>

          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
            Have something
            <span className="block text-[#C9A227]">
              in mind?
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/60 sm:text-lg">
            Don&apos;t overthink it. Send us a WhatsApp message, give us
            a call, or connect with us on Instagram. We&apos;re happy to
            help.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Product Enquiries
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Orders
            </span>

            <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/60">
              Made To Order
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}