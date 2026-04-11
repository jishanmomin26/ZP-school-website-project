import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaQuestionCircle, FaChevronDown, FaBookOpen, FaHeadset } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import PageTransition from '../components/PageTransition';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 }
};

const Help = () => {
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    { q: t('help_faq_1_q'), a: t('help_faq_1_a') },
    { q: t('help_faq_2_q'), a: t('help_faq_2_a') },
    { q: t('help_faq_3_q'), a: t('help_faq_3_a') },
    { q: t('help_faq_4_q'), a: t('help_faq_4_a') },
    { q: t('help_faq_5_q'), a: t('help_faq_5_a') },
    { q: t('help_faq_6_q'), a: t('help_faq_6_a') },
  ];

  const guideSteps = [
    { num: '01', text: t('help_guide_step1') },
    { num: '02', text: t('help_guide_step2') },
    { num: '03', text: t('help_guide_step3') },
    { num: '04', text: t('help_guide_step4') },
  ];

  return (
    <PageTransition>
      {/* Banner */}
      <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-purple-800 to-dark-900" />
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <FaQuestionCircle className="text-5xl text-violet-300 mx-auto mb-4" />
            <h1 className="font-poppins text-4xl md:text-5xl font-bold text-white mb-3">{t('help_title')}</h1>
            <p className="text-white/70 text-lg">{t('help_subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <h2 className="section-title">{t('help_faq_title')}</h2>
          </motion.div>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="bg-white rounded-xl border border-dark-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-dark-50 transition-colors duration-200"
                >
                  <span className="font-medium text-dark-800 pr-4">{faq.q}</span>
                  <motion.span
                    animate={{ rotate: openFaq === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-dark-400 flex-shrink-0"
                  >
                    <FaChevronDown />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {openFaq === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 text-dark-500 text-sm leading-relaxed border-t border-dark-50 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Portal Guide */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-12">
            <FaBookOpen className="text-3xl text-primary-500 mx-auto mb-3" />
            <h2 className="section-title">{t('help_guide_title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {guideSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="flex items-start gap-4 bg-white rounded-xl p-6 border border-dark-100"
              >
                <span className="text-3xl font-poppins font-bold text-primary-200">{step.num}</span>
                <p className="text-dark-700 font-medium mt-1">{step.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <motion.div {...fadeInUp}>
            <FaHeadset className="text-5xl text-primary-500 mx-auto mb-4" />
            <h2 className="font-poppins text-2xl md:text-3xl font-bold text-dark-800 mb-3">{t('help_support_title')}</h2>
            <p className="text-dark-500 mb-8">{t('help_support_text')}</p>
            <Link to="/contact" className="btn-primary inline-flex items-center gap-2">
              {t('help_support_button')}
            </Link>
          </motion.div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Help;
