import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

type PortalProps = {
  children: React.ReactNode;
  rootId?: string;
};

const Portal: React.FC<PortalProps> = ({ children, rootId = 'overlay-root' }) => {
  const elRef = useRef<HTMLDivElement | null>(null);

  if (!elRef.current) {
    elRef.current = document.createElement('div');
  }

  useEffect(() => {
    let root = document.getElementById(rootId);
    if (!root) {
      root = document.createElement('div');
      root.setAttribute('id', rootId);
      root.style.position = 'relative';
      root.style.zIndex = '9999';
      document.body.appendChild(root);
    }
    const element = elRef.current!;
    root.appendChild(element);
    return () => {
      root && element && root.removeChild(element);
      if (root && root.childElementCount === 0) {
        root.parentElement?.removeChild(root);
      }
    };
  }, [rootId]);

  return createPortal(children, elRef.current);
};

export default Portal;


