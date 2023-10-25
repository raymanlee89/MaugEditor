import React, { useRef, useEffect } from 'react';

export const useOutsideClick = (callback) => {
    const ref = useRef();
  
    useEffect(() => {
        const handleClick = (event) => {
            callback();
        };
    
        document.addEventListener('click', handleClick);
    
        return () => {
            document.removeEventListener('click', handleClick);
        };
    }, []);
  
    return ref;
};