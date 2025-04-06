import { useState, useEffect } from "react";

interface TerminalTextProps {
  text: string;
  className?: string;
  typingSpeed?: number;
  showCursor?: boolean;
}

export function TerminalText({ 
  text, 
  className = "", 
  typingSpeed = 50,
  showCursor = true
}: TerminalTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const [cursorVisible, setCursorVisible] = useState(true);

  // Typing effect
  useEffect(() => {
    let i = 0;
    const typing = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(text.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typing);
      }
    }, typingSpeed);

    return () => clearInterval(typing);
  }, [text, typingSpeed]);

  // Cursor blinking effect
  useEffect(() => {
    if (!showCursor) return;
    
    const blinking = setInterval(() => {
      setCursorVisible(prevState => !prevState);
    }, 500);

    return () => clearInterval(blinking);
  }, [showCursor]);

  return (
    <span className={className}>
      {displayedText}
      {showCursor && <span className={`${cursorVisible ? 'opacity-100' : 'opacity-0'}`}>|</span>}
    </span>
  );
}
