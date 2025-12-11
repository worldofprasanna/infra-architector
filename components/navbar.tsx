export default function Navbar() {
  return (
    <nav className="mx-3 m-2 z-50">
      <div className="mx-auto px-4">
        <div className="flex justify-between py-1">
          <a href="https://ezyinfra.dev/" target="_blank" className="flex items-start">
            <img src="/ezyinfra.png" alt="EzyInfra" className="h-8 w-auto" />
          </a>
        </div>
      </div>
    </nav>
  );
}
