"use client";
import FuzzyText from '@/components/FuzzyText';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Main Content */}
      <div className="relative z-10">
        <FuzzyText 
          baseIntensity={0.2} 
          hoverIntensity={0.5} 
          enableHover={true}
          fontSize="clamp(8rem, 20vw, 16rem)"
          color="#ffffff"
        >
          404
        </FuzzyText>
      </div>
    </div>
  );
}