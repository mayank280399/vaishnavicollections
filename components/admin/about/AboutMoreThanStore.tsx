export default function AboutMoreThanStore() {
  return (
    <section className="relative overflow-hidden bg-[#0B1F3A] px-5 py-24 text-white sm:px-8 sm:py-28 lg:px-10">
      <div className="absolute left-1/2 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C9A227]/10" />

      <div className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#C9A227]/10" />

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#C9A227]">
          More Than Just A Store
        </p>

        <h2 className="mt-6 font-serif text-4xl leading-tight sm:text-5xl lg:text-6xl">
          A journey that is still being written.
        </h2>

        <div className="mx-auto mt-8 h-px w-16 bg-[#C9A227]" />

        <p className="mt-8 text-base leading-8 text-white/65 sm:text-lg">
          For us, Vaishnavi Collections is a journey that started from home
          with a few bedsheets and has gradually grown into a physical store
          with a wider collection.
        </p>

        <p className="mt-6 text-base leading-8 text-white/65 sm:text-lg">
          We are still learning, still experimenting and still finding better
          ways to serve our customers.
        </p>

        <p className="mt-10 font-serif text-2xl leading-relaxed text-white sm:text-3xl">
          We want to build a place where people can find{" "}
          <span className="text-[#C9A227]">genuine products</span>,{" "}
          <span className="text-[#C9A227]">reasonable prices</span> and
          products that are{" "}
          <span className="text-[#C9A227]">worth their quality</span>.
        </p>

        <p className="mx-auto mt-8 max-w-2xl text-base leading-8 text-white/55">
          And, most importantly, we want people to feel comfortable coming
          back to us.
        </p>
      </div>
    </section>
  );
}