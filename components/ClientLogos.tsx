import Image from "next/image"

export default function ClientLogos() {
  return (
    <div className="flex flex-col items-center space-y-1">
      <p className="text-xs uppercase text-gray-500 tracking-wide">
        Our Esteemed Clients
      </p>
      <div className="mt-2 flex flex-wrap justify-center items-center gap-6 opacity-70">
        <Image src="/clients/dacio.png" alt="dacio" width={200} height={68} className="h-6 w-auto" />
        <Image src="/clients/finin.png" alt="finin" width={200} height={68} className="h-6 w-auto" />
        <Image src="/clients/nd.png" alt="nd" width={200} height={68} className="h-6 w-auto" />
        <Image src="/clients/taxnodes.png" alt="taxnodes" width={200} height={68} className="h-6 w-auto" />
        <Image src="/clients/politexts.png" alt="politexts" width={200} height={68} className="h-6 w-auto" />
        <Image src="/clients/merchantspring.png" alt="merchantsprings" width={200} height={68} className="h-6 w-auto" />
        <Image src="/clients/backsie.png" alt="backsie" width={200} height={68} className="h-6 w-auto" />
        <Image src="/clients/svaksha.png" alt="svaksha" width={200} height={68} className="h-6 w-auto" />
        <Image src="/clients/hashmato.png" alt="hashmato" width={200} height={68} className="h-5 w-auto" />
        <Image src="/clients/labfinder.png" alt="labfinder" width={200} height={68} className="h-10 w-auto" />
        <Image src="/clients/IIID.png" alt="IIID" width={200} height={68} className="h-8 w-auto" />
      </div>
    </div>
  )
}
