const RefreshBtn = ({ onClick, isSpinning }: { onClick: () => void; isSpinning: boolean }) => {
  return (
    <button 
      onClick={onClick}
      className="p-[10px] border border-gray-300 hover:bg-gray-200 text-black rounded-md flex items-center justify-center"
    >
      <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform duration-500 ${isSpinning ? 'rotate-360' : 'rotate-0'}`} >
        <rect width="24" height="24" fill="none"/>
        <path d="M21.3687 13.5827C21.4144 13.3104 21.2306 13.0526 20.9583 13.0069C20.686 12.9612 20.4281 13.1449 20.3825 13.4173L21.3687 13.5827ZM12 20.5C7.30558 20.5 3.5 16.6944 3.5 12H2.5C2.5 17.2467 6.75329 21.5 12 21.5V20.5ZM3.5 12C3.5 7.30558 7.30558 3.5 12 3.5V2.5C6.75329 2.5 2.5 6.75329 2.5 12H3.5ZM12 3.5C15.3367 3.5 18.2252 5.4225 19.6167 8.22252L20.5122 7.77748C18.9583 4.65062 15.7308 2.5 12 2.5V3.5ZM20.3825 13.4173C19.7081 17.437 16.2112 20.5 12 20.5V21.5C16.7077 21.5 20.6148 18.0762 21.3687 13.5827L20.3825 13.4173Z" fill="#000000"/>
        <path d="M20.4716 2.42157V8.07843H14.8147" stroke="#000000" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </button>
  );
};

export default RefreshBtn;