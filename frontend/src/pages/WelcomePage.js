import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const WelcomePage = () => {
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [weeklyDeals, setWeeklyDeals] = useState([]);

  
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  
  useEffect(() => {
    setIsVisible(true);
  }, []);



  return (
    <div className="bg-black text-white overflow-hidden">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900 via-black to-green-800">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1590779033100-9f60a05a013d?auto=format&fit=crop&w=2000&q=80')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
        </div>
        
        
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-yellow-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center px-6 py-3 bg-white/10 backdrop-blur-xl rounded-full border border-white/20 mb-8 animate-fade-in">
              <span className="text-yellow-400 font-bold text-lg mr-2"></span>
              <span className="text-white font-medium">HEMAT HINGGA 50% OFF</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold mb-8 leading-tight">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Makanan
              </span>
              <br />
              <span className="bg-gradient-to-r from-green-400 to-yellow-400 bg-clip-text text-transparent">
                Surplus
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
              Temukan makanan berkualitas dengan harga terjangkau. 
              <span className="text-green-400 font-semibold"> Hemat uang</span> sambil 
              <span className="text-green-400 font-semibold"> mengurangi limbah makanan</span>.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                to="/register" 
                className="group relative px-8 py-4 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl font-semibold text-lg hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 overflow-hidden"
              >
                <span className="relative z-10">Mulai Sekarang</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <svg className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              
              <Link to="/login" className="px-8 py-4 border-2 border-white/30 rounded-2xl font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-xl">
                Masuk
              </Link>
            </div>
          </div>
        </div>

        
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      
      <section className="py-24 bg-gradient-to-b from-black to-gray-900 relative">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Mengapa Memilih SurplusFood?
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Kami berkomitmen memberikan pengalaman terbaik dalam membeli makanan surplus berkualitas
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '',
                title: 'Hemat Uang',
                description: 'Dapatkan makanan berkualitas dengan diskon hingga 50% dari harga normal'
              },
              {
                icon: '',
                title: 'Kurangi Limbah',
                description: 'Bantu mengurangi limbah makanan dan dampak negatif terhadap lingkungan'
              },
              {
                icon: '',
                title: 'Pengiriman Cepat',
                description: 'Nikmati pengiriman cepat atau ambil langsung di lokasi terdekat'
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className={`group text-center bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/20 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
                style={{ transitionDelay: `${index * 200}ms` }}
              >
                {}
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-gray-400 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-24 bg-gradient-to-b from-gray-900 to-black relative">
        <div className="container mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Mulai Berbelanja Sekarang
            </h2>
            <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
              Bergabunglah dengan ribuan pelanggan yang telah merasakan manfaat SurplusFood
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                to="/register" 
                className="group relative px-10 py-5 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl font-bold text-xl hover:from-green-600 hover:to-green-700 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-green-500/25 overflow-hidden"
              >
                <span className="relative z-10">Daftar Sekarang</span>
                <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              
              <Link 
                to="/login" 
                className="px-10 py-5 border-2 border-white/30 rounded-2xl font-bold text-xl hover:bg-white/10 transition-all duration-300 hover:scale-105 backdrop-blur-xl"
              >
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WelcomePage; 