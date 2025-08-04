import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  src: string;
  alt?: string;
}

const ImagePreview: React.FC<Props> = ({ src, alt }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <img
        src={src}
        alt={alt}
        className="rounded-md max-w-full h-auto cursor-pointer"
        onClick={() => setOpen(true)}
      />
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
          onClick={() => setOpen(false)}
        >
          <img src={src} alt={alt} className="max-w-full max-h-full" />
        </motion.div>
      )}
    </>
  );
};

export default ImagePreview;