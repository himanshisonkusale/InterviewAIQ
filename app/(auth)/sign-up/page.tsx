import AuthForm from "@/components/AuthForm";

const Page = () => {
  return (
    <div className="relative flex w-full items-center justify-center min-h-[80vh] selection:bg-[#00F2FE]/30">
      {/* Landing Page Theme Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden bg-[#05050A] pointer-events-none">
        
        {/* Shimmer and Texture Overlays */}
        <div className="fixed inset-0 pointer-events-none z-[0] mix-blend-overlay opacity-[0.05]">
          <svg className="w-full h-full">
            <filter id="noise">
              <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noise)" />
          </svg>
        </div>

        {/* Ambient Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[#00F2FE] rounded-full blur-[180px] opacity-10 animate-[pulse_8s_infinite]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#1a388b] rounded-full blur-[180px] opacity-20 animate-[pulse_10s_infinite_reverse]" />
        <div className="absolute top-[20%] left-[60%] w-[400px] h-[400px] bg-[#4FACFE] rounded-full blur-[150px] opacity-10 animate-[pulse_6s_infinite]" />

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20 mask-image:linear-gradient(to_bottom,white,transparent)" />
        
        {/* Floating 3D Elements using landing page colors */}
        {/* Cyan Floating Cube */}
        <div 
          className="absolute top-[15%] right-[20%] w-24 h-24 bg-gradient-to-br from-[#00F2FE]/10 to-[#4FACFE]/20 rounded-2xl backdrop-blur-md border border-[#00F2FE]/20 shadow-[0_0_30px_rgba(0,242,254,0.15)] animate-[bounce_6s_infinite]"
          style={{ transform: 'perspective(800px) rotateX(45deg) rotateY(-20deg) rotateZ(10deg)' }}
        />
        {/* Deep Blue Floating Sphere */}
        <div 
          className="absolute bottom-[20%] left-[15%] w-32 h-32 bg-gradient-to-tr from-[#1a388b]/20 to-[#00F2FE]/10 rounded-full backdrop-blur-lg border border-[#00F2FE]/10 shadow-[0_0_40px_rgba(26,56,139,0.3)] animate-[bounce_8s_infinite_reverse]"
          style={{ transform: 'perspective(800px) rotateX(-20deg) rotateY(40deg)' }}
        />
        {/* Floating Pyramid */}
        <div 
          className="absolute top-[30%] left-[10%] w-16 h-16 bg-gradient-to-bl from-[#4FACFE]/20 to-[#00F2FE]/20 rounded-xl backdrop-blur-sm border border-[#4FACFE]/20 shadow-[0_0_20px_rgba(79,172,254,0.2)] animate-[bounce_5s_infinite]"
          style={{ transform: 'perspective(800px) rotateX(60deg) rotateY(30deg) rotateZ(-30deg)' }}
        />
        {/* Floating Ring */}
        <div 
          className="absolute bottom-[35%] right-[10%] w-20 h-20 bg-transparent rounded-full border-[3px] border-dashed border-[#00F2FE]/30 backdrop-blur-sm shadow-[0_0_20px_rgba(0,242,254,0.15)] animate-[spin_10s_linear_infinite]"
          style={{ transform: 'perspective(800px) rotateX(65deg) rotateY(-15deg)' }}
        />
      </div>

      {/* 3D Glassmorphism Form Container matching Landing Page Cards */}
      <div className="relative z-10 w-full flex justify-center animate-fadeIn group perspective-[1000px]">
        <div 
          className="transition-all duration-700 ease-out transform-gpu group-hover:-translate-y-2 group-hover:scale-[1.01] shadow-[0_20px_40px_-15px_rgba(0,0,0,0.7)] group-hover:shadow-[0_0_50px_-15px_rgba(0,242,254,0.3)] rounded-2xl relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* Inner Glow Effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none z-20" />
          
          {/* Glowing Border effect */}
          <div className="absolute -inset-[1px] bg-gradient-to-b from-[#00F2FE]/30 to-transparent rounded-[17px] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none -z-10" />
          
          <AuthForm type="sign-up" />
        </div>
      </div>
    </div>
  );
};

export default Page;
