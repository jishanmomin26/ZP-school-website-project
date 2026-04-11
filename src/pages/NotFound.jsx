import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import PageTransition from '../components/PageTransition';

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <PageTransition>
      <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-dark-50 via-primary-50/20 to-dark-50 px-4">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative mb-8">
              <span className="text-[180px] md:text-[240px] font-poppins font-bold text-dark-100 leading-none select-none">
                404
              </span>
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              >
                <span className="text-6xl">🏫</span>
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="font-poppins text-3xl md:text-4xl font-bold text-dark-800 mb-4"
          >
            {t('notfound_title')}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-dark-500 text-lg mb-8 max-w-md mx-auto"
          >
            {t('notfound_text')}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link to="/" className="btn-primary inline-flex items-center gap-2">
              ← {t('notfound_button')}
            </Link>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default NotFound;
