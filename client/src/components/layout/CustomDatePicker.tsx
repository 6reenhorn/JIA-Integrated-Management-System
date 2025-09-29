import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const CustomDateInput = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>((props, ref) => (
    <div className="relative">
        <input
        {...props}
        ref={ref}
        placeholder="yyyy-MM-dd"
        className={`${props.className} pr-10`}
        />
        <svg
        fill="#000000"
        height="20px"
        width="20px"
        version="1.1"
        id="Layer_1"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 490 490"
        stroke="#000000"
        className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none"
        >
        <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
        <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
        <g id="SVGRepo_iconCarrier">
            <g>
            <g>
                <g>
                <path d="M480,50h-55V10c0-5.523-4.477-10-10-10h-60c-5.523,0-10,4.477-10,10v40h-60V10c0-5.523-4.477-10-10-10h-60 c-5.523,0-10,4.477-10,10v40h-60V10c0-5.523-4.477-10-10-10H75c-5.523,0-10,4.477-10,10v40H10C4.477,50,0,54.477,0,60v95h490V60 C490,54.477,485.523,50,480,50z M125,80H85V20h40V80z M265,80h-40V20h40V80z M405,80h-40V20h40V80z"></path>
                <path d="M0,480c0,5.523,4.477,10,10,10h470c5.523,0,10-4.477,10-10V177H0V480z M362.5,214c0-4.142,3.358-7.5,7.5-7.5h50 c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V214z M362.5,304 c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V304z M362.5,394c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50 c-4.142,0-7.5-3.358-7.5-7.5V394z M262.5,214c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50 c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V214z M262.5,304c0-4.142,3.358-7.5,7.5-7.5h50 c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V304z M262.5,394 c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V394z M162.5,214c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50 c-4.142,0-7.5-3.358-7.5-7.5V214z M162.5,304c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.5,7.5,7.5v50 c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V304z M162.5,394c0-4.142,3.358-7.5,7.5-7.5h50 c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5h-50c-4.142,0-7.5-3.358-7.5-7.5V394z M62.5,214 c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5H70c-4.142,0-7.5-3.358-7.5-7.5V214z M62.5,304c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5H70c-4.142,0-7.5-3.358-7.5-7.5 V304z M62.5,394c0-4.142,3.358-7.5,7.5-7.5h50c4.142,0,7.5,3.358,7.5,7.5v50c0,4.142-3.358,7.5-7.5,7.5H70 c-4.142,0-7.5-3.358-7.5-7.5V394z"></path>
                </g>
            </g>
            </g>
        </g>
        </svg>
    </div>
    ));

    interface CustomDatePickerProps {
    selected: Date | null;
    onChange: (date: Date | null) => void;
    className?: string;
    }

    const CustomDatePicker: React.FC<CustomDatePickerProps> = ({
    selected,
    onChange,
    className = ''
    }) => {
    return (
        <>
        <style dangerouslySetInnerHTML={{ __html: `
            .react-datepicker-popper {
            z-index: 9999 !important;
            }
            .react-datepicker {
            font-family: inherit;
            }
        ` }} />
        <DatePicker
            selected={selected}
            onChange={onChange}
            customInput={<CustomDateInput />}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none transition-all duration-200 bg-gray-100 ${className}`}
            dateFormat="yyyy-MM-dd"
            popperPlacement="bottom-start"
            withPortal={false}
        />
        </>
    );
};

export default CustomDatePicker;