import Image from "next/image";

export default function Navbar() {
  return (
    <nav className="mx-3 my-5 sticky top-0 z-50">
      <div className="mx-auto px-6 lg:px-12">
        <div className="flex justify-between py-2">
          <a href="https://ezyinfra.dev/" target="_blank" className="flex items-start">
            <Image
              src="/ezyinfra.png"
              alt="EzyInfra"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </a>
        </div>
      </div>
    </nav>
  );
}
