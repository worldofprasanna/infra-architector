import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="mx-3 my-5  sticky top-0 z-50">
      <div className=" mx-auto mb-3 px-6 lg:px-12">
        <div className="flex justify-between py-2">
          <Link href="/" className="flex items-start">
            <Image
              src="/ezyinfra.png"
              alt="EzyInfra"
              width={120}
              height={40}
              className="h-10 w-auto"
              priority
            />
          </Link>
        </div>
      </div>
    </nav>
  );
}
