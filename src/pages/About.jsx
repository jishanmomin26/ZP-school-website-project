import { motion } from 'framer-motion';
import { FaBullseye, FaEye, FaTrophy, FaGraduationCap, FaMedal, FaAward, FaLaptop, FaQuoteLeft } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import PageTransition from '../components/PageTransition';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 }
};

const About = () => {
  const { t } = useLanguage();

  const achievements = [
    { icon: FaTrophy, title: t('about_achievement_1'), desc: t('about_achievement_1_desc'), color: 'from-amber-400 to-amber-600' },
    { icon: FaMedal, title: t('about_achievement_2'), desc: t('about_achievement_2_desc'), color: 'from-emerald-400 to-emerald-600' },
    { icon: FaAward, title: t('about_achievement_3'), desc: t('about_achievement_3_desc'), color: 'from-blue-400 to-blue-600' },
    { icon: FaLaptop, title: t('about_achievement_4'), desc: t('about_achievement_4_desc'), color: 'from-violet-400 to-violet-600' },
  ];

  return (
    <PageTransition>
      {/* Banner */}
      <section className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/school-5.jpg" alt="About ZP Kudave" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-br from-dark-900/85 via-primary-900/75 to-dark-900/90" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="font-poppins text-4xl md:text-5xl font-bold text-white mb-3"
          >
            {t('about_banner_title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-white/70 text-lg"
          >
            {t('about_banner_subtitle')}
          </motion.p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div
              {...fadeInUp}
              className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-2xl p-8 border border-primary-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                <FaBullseye className="text-white text-2xl" />
              </div>
              <h3 className="font-poppins font-bold text-2xl text-dark-800 mb-4">{t('about_mission_title')}</h3>
              <p className="text-dark-600 leading-relaxed">{t('about_mission_text')}</p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-gradient-to-br from-accent-50 to-amber-50 rounded-2xl p-8 border border-accent-100"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-accent-500 to-amber-600 rounded-xl flex items-center justify-center mb-5 shadow-lg">
                <FaEye className="text-white text-2xl" />
              </div>
              <h3 className="font-poppins font-bold text-2xl text-dark-800 mb-4">{t('about_vision_title')}</h3>
              <p className="text-dark-600 leading-relaxed">{t('about_vision_text')}</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Image + Text */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div {...fadeInUp} className="relative">
              <img src="/images/school-6.jpg" alt="Cultural Event" className="rounded-2xl shadow-xl w-full h-80 lg:h-[420px] object-cover" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary-200 rounded-2xl -z-10" />
            </motion.div>
            <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.2 }}>
              <h2 className="section-title mb-6">{t('about_preview_title')}</h2>
              <p className="text-dark-500 leading-relaxed mb-4">{t('about_preview_text')}</p>
              <p className="text-dark-500 leading-relaxed">
                Our school emphasizes a holistic approach to education that integrates academic learning with cultural activities, sports, and community engagement. We believe in nurturing every child's potential and helping them grow into responsible citizens.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="section-title">{t('about_achievements_title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((a, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="text-center bg-white rounded-2xl p-6 border border-dark-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${a.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                  <a.icon className="text-white text-2xl" />
                </div>
                <h4 className="font-poppins font-bold text-dark-800 mb-2">{a.title}</h4>
                <p className="text-dark-500 text-sm">{a.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Teacher Message */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <h2 className="section-title">{t('about_principal_title')}</h2>
          </motion.div>
          <motion.div
            {...fadeInUp}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-2xl p-8 md:p-10 shadow-lg border border-dark-100"
          >
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="w-32 h-32 rounded-2xl overflow-hidden flex-shrink-0 shadow-lg">
                <img src="/images/school-8.jpg" alt={t('about_principal_name')} className="w-full h-full object-cover" />
              </div>
              <div>
                <FaQuoteLeft className="text-3xl text-primary-200 mb-4" />
                <p className="text-dark-600 leading-relaxed italic mb-6">
                  "{t('about_principal_message')}"
                </p>
                <div>
                  <h4 className="font-poppins font-bold text-dark-800">{t('about_principal_name')}</h4>
                  <p className="text-primary-600 text-sm font-medium">{t('about_principal_role')}</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Gallery on About Page */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="section-title">{t('gallery_title')}</h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[3, 4, 7, 6].map((num, i) => (
              <motion.div
                key={num}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group rounded-xl overflow-hidden"
              >
                <img
                  src={`/images/school-${num}.jpg`}
                  alt={`School activity ${num}`}
                  className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default About;
