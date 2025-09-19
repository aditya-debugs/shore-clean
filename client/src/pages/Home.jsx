import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Trophy, Heart, Sparkles, Globe, Shield, Award, Waves, ChevronLeft, ChevronRight, MapPin, Clock, ArrowRight, Star, Loader, Quote, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(0);
  const [loading, setLoading] = useState(true);
  const [quotes, setQuotes] = useState([]);
  const [carouselSlides, setCarouselSlides] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [testimonials, setTestimonials] = useState([]);
  const [features, setFeatures] = useState([]);
  
  // Safely get auth state with fallbacks
  let isAuthenticated = false;
  let user = null;
  
  try {
    const authState = useAuth();
    isAuthenticated = authState?.isAuthenticated || false;
    user = authState?.user || null;
  } catch (error) {
    console.log('Auth not available:', error.message);
  }

  // Fetch data from API (to be implemented)
  useEffect(() => {
    // Simulate API call
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Simulated data - replace with actual API calls
        setTimeout(() => {
          setQuotes([
            {
              text: "The ocean is a mighty harmonist. The best way to appreciate it is to help preserve it.",
              author: "William Wordsworth"
            },
            {
              text: "We won't have a society if we destroy the environment. Every piece of plastic removed from our beaches matters.",
              author: "Margaret Mead"
            },
            {
              text: "The greatest threat to our planet is the belief that someone else will save it. Join us today.",
              author: "Robert Swan"
            },
            {
              text: "Clean beaches don't happen by chance, they happen by change. Be that change.",
              author: "Unknown"
            }
          ]);
          
          setCarouselSlides([
            {
              title: "Join the Coastal Cleanup Movement",
              description: "Be part of the solution to protect our oceans and beaches from pollution.",
              bgImage: "https://images.unsplash.com/photo-1536152470836-b943b246224c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1630&q=80"
            },
            {
              title: "Track Your Environmental Impact",
              description: "See real-time data on how your efforts contribute to cleaner coastlines.",
              bgImage: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1526&q=80"
            },
            {
              title: "Earn Rewards While Making a Difference",
              description: "Get recognized for your contributions with our gamified reward system.",
              bgImage: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80"
            }
          ]);
          
          setUpcomingEvents([]);
          setTestimonials([]);
          
          setFeatures([
            {
              icon: Users,
              title: 'Role-Based Access',
              description: 'Separate dashboards for organizers and volunteers with tailored experiences.',
              gradient: 'from-blue-400 to-cyan-400'
            },
            {
              icon: Calendar,
              title: 'Smart Event Management',
              description: 'Create, edit, and track events with QR-based attendance and real-time updates.',
              gradient: 'from-cyan-400 to-teal-400'
            },
            {
              icon: Sparkles,
              title: 'AI-Powered Content',
              description: 'Automated flyer generation and multilingual chatbot support for better engagement.',
              gradient: 'from-teal-400 to-green-400'
            },
            {
              icon: Trophy,
              title: 'Gamified Rewards',
              description: 'Earn badges, certificates, and rewards while making a real environmental impact.',
              gradient: 'from-green-400 to-emerald-400'
            },
            {
              icon: Shield,
              title: 'Impact Tracking',
              description: 'Real-time analytics dashboard with comprehensive impact measurement and reporting.',
              gradient: 'from-purple-400 to-indigo-400'
            },
            {
              icon: Globe,
              title: 'CSR Integration',
              description: 'Seamless donation management with 80G tax benefits and corporate partnerships.',
              gradient: 'from-indigo-400 to-blue-400'
            }
          ]);
          
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (carouselSlides.length > 0) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [carouselSlides]);

  useEffect(() => {
    if (quotes.length > 0) {
      const interval = setInterval(() => {
        setCurrentQuote((prev) => (prev + 1) % quotes.length);
      }, 6000);
      return () => clearInterval(interval);
    }
  }, [quotes]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin text-cyan-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading ShoreClean...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <Navbar />
      
      {/* Hero Section with Background Carousel */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden min-h-screen flex items-center">
        {/* Background Carousel */}
        <div className="absolute inset-0 z-0">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 bg-cover bg-center ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              style={{ 
                backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${slide.bgImage})` 
              }}
            ></div>
          ))}
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10 text-center text-white">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Protect Our
            <br />
            <span className="bg-gradient-to-r from-cyan-300 to-emerald-300 bg-clip-text text-transparent">
              Coastal Heritage
            </span>
          </h1>
          
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8 leading-relaxed">
            Join the movement to keep our beaches clean and oceans healthy through technology-powered community action.
          </p>
          
          {/* Quotes Section */}
          <div className="max-w-3xl mx-auto mb-12">
            {quotes.map((quote, index) => (
              <div
                key={index}
                className={`transition-opacity duration-1000 text-center ${
                  index === currentQuote ? 'opacity-100' : 'opacity-0 absolute'
                }`}
              >
                <Quote className="h-8 w-8 mx-auto mb-4 text-cyan-200 opacity-80" />
                <p className="text-xl italic mb-4 text-white/95">"{quote.text}"</p>
                <p className="text-cyan-200 font-medium">— {quote.author}</p>
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <>
                <Link 
                  to="/events"
                  className="px-8 py-4 bg-white/90 text-cyan-700 rounded-xl hover:bg-white transition-all duration-300 shadow-lg font-semibold flex items-center justify-center"
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Browse Events
                </Link>
                <Link 
                  to="/dashboard"
                  className="px-8 py-4 bg-cyan-600/90 text-white rounded-xl hover:bg-cyan-600 border border-cyan-500/50 transition-all duration-300 font-semibold flex items-center justify-center"
                >
                  <Trophy className="h-5 w-5 mr-2" />
                  My Dashboard
                </Link>
              </>
            ) : (
              <>
                <Link 
                  to="/register"
                  className="px-8 py-4 bg-white/90 text-cyan-700 rounded-xl hover:bg-white transition-all duration-300 shadow-lg font-semibold flex items-center justify-center"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Join as Volunteer
                </Link>
                <Link 
                  to="/signin"
                  className="px-8 py-4 bg-cyan-600/90 text-white rounded-xl hover:bg-cyan-600 border border-cyan-500/50 transition-all duration-300 font-semibold flex items-center justify-center"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Upcoming Events Section */}
      <section className="py-20 px-6 bg-white/70">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Upcoming <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Events</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our upcoming coastal cleanup events and make a real difference in your community.
            </p>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-4xl">{event.image}</div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">
                          {formatDate(event.date)}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {event.time}
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">
                      {event.title}
                    </h3>
                    
                    <div className="flex items-center text-gray-600 mb-3">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span className="text-sm">{event.location}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-cyan-500">
                        <Users className="h-4 w-4 mr-1" />
                        <span className="text-sm font-medium">{event.participants} joined</span>
                      </div>
                      <div className="text-xs text-gray-500">by {event.organizer}</div>
                    </div>
                    
                    {isAuthenticated ? (
                      <button className="w-full mt-4 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors duration-300 font-medium">
                        Join Event
                      </button>
                    ) : (
                      <Link 
                        to="/register"
                        className="w-full mt-4 px-4 py-2 bg-cyan-50 text-cyan-600 rounded-lg hover:bg-cyan-100 transition-colors duration-300 font-medium text-center block"
                      >
                        Sign Up to Join
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/80 rounded-xl border border-gray-200/50 mb-12">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No upcoming events</h3>
              <p className="text-gray-500">Check back later for new coastal cleanup events.</p>
            </div>
          )}

          <div className="text-center">
            <Link 
              to={isAuthenticated ? "/events" : "/register"}
              className="inline-flex items-center px-8 py-3 bg-white border border-cyan-200 text-cyan-600 rounded-xl hover:bg-cyan-50 hover:border-cyan-300 transition-all duration-300 font-semibold"
            >
              {isAuthenticated ? "View More Events" : "Join to See Events"}
              <ArrowRight className="h-5 w-5 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-6">
              Why Choose <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">ShoreClean?</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform addresses every challenge in coastal cleanup coordination, 
              from volunteer engagement to impact measurement.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className="group p-8 bg-white/80 rounded-xl hover:shadow-lg transition-all duration-300 border border-white backdrop-blur-sm"
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}>
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 px-6 bg-white/80">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              What Our <span className="bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent">Community Says</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Hear from organizers and volunteers who are making a difference with ShoreClean.
            </p>
          </div>

          {testimonials.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <div
                  key={testimonial.id}
                  className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 text-amber-400 fill-current" />
                    ))}
                  </div>
                  
                  <p className="text-gray-600 mb-6 leading-relaxed italic">
                    "{testimonial.text}"
                  </p>
                  
                  <div className="flex items-center">
                    <div className="text-3xl mr-4">{testimonial.image}</div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{testimonial.name}</h4>
                      <p className="text-cyan-500 text-sm">{testimonial.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white/90 rounded-xl border border-gray-200/50">
              <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-600 mb-2">No testimonials yet</h3>
              <p className="text-gray-500">Be the first to share your ShoreClean experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-br from-cyan-50 to-blue-50">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-400/20 to-blue-600/20"></div>
            <div className="relative z-10">
              <Award className="h-16 w-16 mx-auto mb-6 opacity-90" />
              <h2 className="text-4xl font-bold mb-6">Ready to Make an Impact?</h2>
              <p className="text-xl mb-8 opacity-95 max-w-2xl mx-auto">
                Join our growing community of environmental champions and help create cleaner, 
                healthier coastlines for future generations.
              </p>
              <Link 
                to={isAuthenticated ? "/dashboard" : "/register"}
                className="inline-block px-10 py-4 bg-white text-cyan-600 rounded-2xl hover:bg-gray-100 transform hover:scale-105 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl"
              >
                {isAuthenticated ? "Go to Dashboard" : "Get Started Today"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;