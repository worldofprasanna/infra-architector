
const TalkToUsButton = () => {
  return (
    <a
      href="https://calendly.com/worldofprasanna/ezyinfra"
      title="Talk to Us"
      className="relative inline-flex items-center px-6 py-4 font-semibold text-black transition-all duration-200 bg-green-400 rounded-full hover:text-white focus:text-white overflow-hidden group transform hover:scale-95"
      role="button"
    >
      <span
        className="absolute inset-0 transition-all duration-300 group-hover:bg-gradient-to-r group-hover:from-red-500 group-hover:via-yellow-500 group-hover:to-green-500"
        style={{
          backgroundSize: "200% 200%",
          animation: "rainbowMotion 1.5s ease infinite",
        }}
      ></span>
      <span className="relative z-10">Talk to Us</span>
      <svg
        className="w-6 h-6 ml-8 -mr-2 relative z-10"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.5"
          d="M13 7l5 5m0 0l-5 5m5-5H6"
        />
      </svg>
    </a>
  );
};

export default TalkToUsButton;