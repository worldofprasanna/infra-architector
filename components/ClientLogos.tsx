import Image from "next/image"

export default function ClientLogos() {
  return (
    <div className="flex flex-col items-center space-y-1">
      <p className="text-xs uppercase text-gray-500 tracking-wide">
        Our Esteemed Clients
      </p>
      <div className="mt-2 flex flex-wrap justify-center items-center gap-6 opacity-70">
        <Image src="/dacio-logo.png" alt="dacio" width={70} height={28} className="h-5 w-auto" />
        <Image src="/finin.png" alt="finin" width={84} height={28} className="h-5 w-auto" />
        <Image src="/nd.png" alt="nd" width={70} height={28} className="h-5 w-auto" />
        <Image src="/taxnodes.png" alt="taxnodes" width={98} height={28} className="h-5 w-auto" />
        <Image src="/politexts.jpg" alt="politexts" width={98} height={28} className="h-5 w-auto" />
        <Image src="/merchantspring_logo.jpeg" alt="merchantsprings" width={68} height={28} className="h-12 w-auto" />
        <Image src="/backsie.png" alt="backsie" width={68} height={28} className="h-6 w-auto" />
        <Image src="/svaksha.png" alt="svaksha" width={68} height={28} className="h-6 w-auto" />
        <Image src="/hashconnect.jpeg" alt="hashconnect" width={68} height={28} className="h-12 w-auto" />
        <Image src="/labfinder.png" alt="labfinder" width={68} height={28} className="h-5 w-auto" />
      </div>
    </div>
  )
}
