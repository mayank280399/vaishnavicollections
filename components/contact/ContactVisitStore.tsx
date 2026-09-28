import {
  ArrowUpRight,
  Clock3,
  MapPin,
  Phone,
} from "lucide-react";

type ContactData = {
  businessName: string;
  phone: string;
  address: string;
  mapsUrl: string;
  hours: string;
};

interface ContactVisitStoreProps {
  data: ContactData;
}

export default function ContactVisitStore({
  data,
}: ContactVisitStoreProps) {
  const phoneUrl = data.phone
    ? `tel:${data.phone.replace(/\s+/g, "")}`
    : "";

  return (
    <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="grid overflow-hidden rounded-[2rem] bg-[#0B1F3A] lg:grid-cols-[1.05fr_0.95fr]">
          {/* Store Image */}
          <div className="relative min-h-[340px] overflow-hidden sm:min-h-[420px] lg:min-h-[560px]">
            <img
              src="/brands/vc-exterior.png"
              alt={`${data.businessName} store exterior`}
              className="absolute inset-0 h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/75 via-[#0B1F3A]/10 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between gap-4 sm:bottom-8 sm:left-8 sm:right-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#C9A227]">
                  Our Store
                </p>

                <p className="mt-2 font-serif text-2xl text-white sm:text-3xl">
                  Vaishnavi Collections
                </p>
              </div>

              <div className="hidden rounded-full border border-white/20 bg-[#0B1F3A]/60 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur sm:block">
                Indra Park · New Delhi
              </div>
            </div>
          </div>

          {/* Store Details */}
          <div className="flex flex-col justify-center p-7 text-white sm:p-10 lg:p-14">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C9A227]">
              Visit Us
            </p>

            <h2 className="mt-4 max-w-md font-serif text-3xl leading-tight sm:text-4xl">
              Come see us in person.
            </h2>

            <p className="mt-5 max-w-lg text-sm leading-7 text-white/60 sm:text-base">
              Visit our store, explore our collection and talk to us
              directly about what you&apos;re looking for.
            </p>

            <div className="mt-9 space-y-6">
              {/* Address */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#C9A227]">
                  <MapPin size={19} strokeWidth={1.7} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Store Address
                  </p>

                  <p className="mt-1.5 max-w-sm text-sm leading-6 text-white/55">
                    {data.address}
                  </p>
                </div>
              </div>

              {/* Hours */}
              <div className="flex gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 text-[#C9A227]">
                  <Clock3 size={19} strokeWidth={1.7} />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Store Hours
                  </p>

                  <p className="mt-1.5 max-w-sm text-sm leading-6 text-white/55">
                    {data.hours}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              {data.mapsUrl && (
                <a
                  href={data.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-[#C9A227] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-[#0B1F3A] transition hover:bg-[#D8B63B]"
                >
                  Get Directions
                  <ArrowUpRight size={15} />
                </a>
              )}

              {phoneUrl && (
                <a
                  href={phoneUrl}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-6 py-3.5 text-xs font-bold uppercase tracking-[0.15em] text-white transition hover:border-[#C9A227] hover:text-[#C9A227]"
                >
                  <Phone size={14} />
                  Call Store
                </a>
              )}
            </div>

            <p className="mt-6 text-xs leading-5 text-white/35">
              Prefer messaging before visiting? You can also connect
              with us on WhatsApp or Instagram.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}