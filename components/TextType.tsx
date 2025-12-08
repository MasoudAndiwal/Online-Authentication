'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface TextTypeProps {
  texts: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  cursorChar?: string;
  showCursor?: boolean;
  loop?: boolean;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
}

const TextType: React.FC<TextTypeProps> = ({
  texts,
  className = '',
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  cursorChar = '|',
  showCursor = true,
  loop = true,
  tag = 'span',
}) => {
  const [displayText, setDisplayText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const currentText = texts[textIndex];

    const handleTyping = () => {
      if (isPaused) {
        timeoutRef.current = setTimeout(() => {
          setIsPaused(false);
          setIsDeleting(true);
        }, pauseDuration);
        return;
      }

      if (isDeleting) {
        if (displayText.length > 0) {
          timeoutRef.current = setTimeout(() => {
            setDisplayText(prev => prev.slice(0, -1));
          }, deletingSpeed);
        } else {
          setIsDeleting(false);
          setTextIndex(prev => (loop ? (prev + 1) % texts.length : Math.min(prev + 1, texts.length - 1)));
        }
      } else {
        if (displayText.length < currentText.length) {
          timeoutRef.current = setTimeout(() => {
            setDisplayText(currentText.slice(0, displayText.length + 1));
          }, typingSpeed);
        } else {
          if (loop || textIndex < texts.length - 1) {
            setIsPaused(true);
          }
        }
      }
    };

    handleTyping();

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [displayText, isDeleting, isPaused, textIndex, texts, typingSpeed, deletingSpeed, pauseDuration, loop]);

  const Tag = tag;

  return (
    <Tag className={className}>
      <span>{displayText}</span>
      {showCursor && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
          className="ml-0.5"
        >
          {cursorChar}
        </motion.span>
      )}
    </Tag>
  );
};

export default TextType;
