import React from "react";

const CustomTitleBar: React.FC = () => {
    return (
        <div className="title-bar text-white flex items-center justify-end p-2 space-x-2">
            <button onClick={() => window.electronAPI.minimize()}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="5" y="10" width="15" height="1" fill="white"/>
                </svg>
            </button>
            <button onClick={() => window.electronAPI.maximize()}>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <rect x="4" y="4" width="12" height="12" stroke="white" strokeWidth="1" fill="none"/>
                </svg>
            </button>
            <button onClick={() => window.electronAPI.close()}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <line x1="4" y1="4" x2="16" y2="16" stroke="white" strokeWidth="1"/>
                    <line x1="16" y1="4" x2="4" y2="16" stroke="white" strokeWidth="1"/>
                </svg>
            </button>
        </div>
    );
}

export default CustomTitleBar;