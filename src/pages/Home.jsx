import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaGraduationCap, FaClipboardCheck, FaChartLine, FaHandHoldingHeart, FaUtensils, FaRunning, FaBook, FaLaptop, FaMusic, FaTint, FaMapMarkerAlt, FaBullhorn, FaCalendarAlt, FaArrowRight } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import { notices, galleryImages } from '../data/dummyData';
import PageTransition from '../components/PageTransition';
import EventSlider from "../components/EventSlider";

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 }
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

const Home = () => {
  const { t } = useLanguage();

  const quickInfoCards = [
    { icon: FaGraduationCap, title: t('quick_classes'), desc: t('quick_classes_desc'), color: 'from-blue-500 to-blue-700' },
    { icon: FaClipboardCheck, title: t('quick_attendance'), desc: t('quick_attendance_desc'), color: 'from-emerald-500 to-emerald-700' },
    { icon: FaChartLine, title: t('quick_results'), desc: t('quick_results_desc'), color: 'from-violet-500 to-violet-700' },
    { icon: FaHandHoldingHeart, title: t('quick_donation'), desc: t('quick_donation_desc'), color: 'from-amber-500 to-amber-700' },
  ];

  const facilities = [
    { icon: FaUtensils, title: t('facility_meal'), desc: t('facility_meal_desc'), color: 'text-orange-500 bg-orange-50' },
    { icon: FaRunning, title: t('facility_sports'), desc: t('facility_sports_desc'), color: 'text-green-500 bg-green-50' },
    { icon: FaBook, title: t('facility_books'), desc: t('facility_books_desc'), color: 'text-blue-500 bg-blue-50' },
    { icon: FaLaptop, title: t('facility_digital'), desc: t('facility_digital_desc'), color: 'text-purple-500 bg-purple-50' },
    { icon: FaMusic, title: t('facility_cultural'), desc: t('facility_cultural_desc'), color: 'text-pink-500 bg-pink-50' },
    { icon: FaTint, title: t('facility_water'), desc: t('facility_water_desc'), color: 'text-cyan-500 bg-cyan-50' },
  ];

  return (
    <PageTransition>
      {/* ===== HERO SECTION ===== */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="/images/school-1.jpg"
            alt="RZP Kudave School"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900/85 via-primary-900/75 to-dark-900/90" />
        </div>

        {/* Animated Decorative Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl animate-float delay-500" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full text-white/80 text-sm mb-6 border border-white/10">
              <FaMapMarkerAlt className="text-accent-400" />
              {t('hero_location')}
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="font-poppins text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-4"
          >
            {t('hero_title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="text-lg sm:text-xl text-white/70 mb-10 font-light"
          >
            {t('hero_subtitle')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/about" className="btn-outline border-white/30 text-white hover:bg-white hover:text-dark-900 backdrop-blur-sm">
              {t('hero_explore')}
            </Link>
            <Link to="/donate" className="btn-accent text-lg">
              {t('hero_donate')} →
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <motion.div
              animate={{ y: [0, 12, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1.5 h-1.5 bg-white rounded-full mt-2"
            />
          </div>
        </motion.div>
      </section>

      {/* ===== QUICK INFO CARDS ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickInfoCards.map((card, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative bg-white rounded-2xl p-6 border border-dark-100 hover:border-transparent hover:shadow-2xl hover:shadow-dark-900/10 hover:-translate-y-2 transition-all duration-500"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <card.icon className="text-white text-2xl" />
                </div>
                <h3 className="font-poppins font-bold text-lg text-dark-800 mb-2">{card.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{card.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SCHOOL EVENTS ===== */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp}>
              <span className="inline-block px-3 py-1 bg-primary-50 text-primary-600 text-sm font-semibold rounded-full mb-4">
                {t('events_tag')}
              </span>
              <h2 className="section-title mb-6">{t('events_title')}</h2>
              <p className="text-dark-500 leading-relaxed">{t('events_text')}</p>
            </motion.div>
            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <EventSlider />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/30 to-transparent" />
              </div>
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-accent-400 rounded-2xl -z-10" />
              <div className="absolute -top-4 -left-4 w-16 h-16 bg-primary-200 rounded-xl -z-10" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== FACILITIES ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="section-title">{t('facilities_title')}</h2>
            <p className="section-subtitle">{t('facilities_subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map((f, i) => (
              <motion.div
                key={i}
                {...stagger}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group bg-white rounded-2xl p-6 border border-dark-100 hover:border-transparent hover:shadow-xl hover:-translate-y-1 transition-all duration-400"
              >
                <div className={`w-12 h-12 ${f.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon className="text-xl" />
                </div>
                <h3 className="font-poppins font-semibold text-dark-800 mb-2">{f.title}</h3>
                <p className="text-dark-500 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== NOTICE BOARD ===== */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="section-title">{t('notice_title')}</h2>
            <p className="section-subtitle">{t('notice_subtitle')}</p>
          </motion.div>
          <div className="max-w-3xl mx-auto space-y-4">
            {notices.slice(0, 4).map((notice, i) => (
              <motion.div
                key={notice.id}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className={`bg-white rounded-xl p-5 border-l-4 ${
                  notice.important ? 'border-l-accent-500' : 'border-l-primary-500'
                } shadow-sm hover:shadow-md transition-shadow duration-300`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <FaBullhorn className={`text-sm ${notice.important ? 'text-accent-500' : 'text-primary-500'}`} />
                      <h4 className="font-poppins font-semibold text-dark-800">{notice.title}</h4>
                      {notice.important && (
                        <span className="px-2 py-0.5 bg-accent-50 text-accent-600 text-xs font-semibold rounded-full">
                          Important
                        </span>
                      )}
                    </div>
                    <p className="text-dark-500 text-sm">{notice.content}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-dark-400 text-xs font-medium whitespace-nowrap">
                    <FaCalendarAlt />
                    {notice.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== GALLERY ===== */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="section-title">{t('gallery_title')}</h2>
            <p className="section-subtitle">{t('gallery_subtitle')}</p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((img, i) => (
              <motion.div
                key={img.id}
                {...stagger}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className={`group relative rounded-xl overflow-hidden cursor-pointer ${
                  i === 0 ? 'md:col-span-2 md:row-span-2' : ''
                }`}
              >
                <img
                  src={img.src}
                  alt={img.alt}
                  className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <p className="text-white text-sm font-medium">{img.alt}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DONATION CTA ===== */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-60 h-60 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <h2 className="font-poppins text-3xl md:text-4xl font-bold text-white mb-4">
              {t('donation_cta_title')}
            </h2>
            <p className="text-white/70 text-lg leading-relaxed mb-8">
              {t('donation_cta_text')}
            </p>
            <Link to="/donate" className="btn-accent text-lg inline-flex items-center gap-2">
              {t('donation_cta_button')} <FaHandHoldingHeart />
            </Link>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Home;
