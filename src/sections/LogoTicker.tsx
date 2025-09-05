"use client";

import Image from "next/image";

const logos = [
  {
    src: "https://tailwindui.com/img/logos/158x48/transistor-logo-white.svg",
    alt: "Transistor",
  },
  {
    src: "https://tailwindui.com/img/logos/158x48/reform-logo-white.svg",
    alt: "Reform",
  },
  {
    src: "https://tailwindui.com/img/logos/158x48/tuple-logo-white.svg",
    alt: "Tuple",
  },
  {
    src: "https://tailwindui.com/img/logos/158x48/savvycal-logo-white.svg",
    alt: "SavvyCal",
  },
  {
    src: "https://tailwindui.com/img/logos/158x48/statamic-logo-white.svg",
    alt: "Statamic",
  },
];

const LogoTicker = () => {
  return (
    <div className="py-8">
      <div className="container">
        <p className="text-center text-muted-foreground mb-6">
          Trusted by the world&apos;s most innovative teams
        </p>
        <div className="flex justify-center gap-x-8 sm:gap-x-12 lg:gap-x-16">
          {logos.map((logo, index) => (
            <Image
              key={index}
              src={logo.src}
              alt={logo.alt}
              width={158}
              height={48}
              className="h-8 w-auto"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default LogoTicker;