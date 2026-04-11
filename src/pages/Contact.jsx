import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaClock, FaPaperPlane } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import PageTransition from '../components/PageTransition';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 }
};

const Contact = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors] = useState({});

  const contactCards = [
    { icon: FaMapMarkerAlt, title: t('contact_address_title'), info: t('footer_address'), color: 'text-blue-500 bg-blue-50' },
    { icon: FaPhoneAlt, title: t('contact_phone_title'), info: t('footer_phone'), color: 'text-green-500 bg-green-50' },
    { icon: FaEnvelope, title: t('contact_email_title'), info: t('footer_email'), color: 'text-purple-500 bg-purple-50' },
    { icon: FaClock, title: t('contact_hours_title'), info: t('contact_hours'), color: 'text-amber-500 bg-amber-50' },
  ];

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Name is required';
    if (!form.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Invalid email';
    if (!form.subject.trim()) newErrors.subject = 'Subject is required';
    if (!form.message.trim()) newErrors.message = 'Message is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const messages = JSON.parse(localStorage.getItem('zpkudave_messages') || '[]');
    messages.push({ ...form, date: new Date().toISOString() });
    localStorage.setItem('zpkudave_messages', JSON.stringify(messages));
    toast.success(t('contact_success'), { duration: 4000 });
    setForm({ name: '', email: '', subject: '', message: '' });
    setErrors({});
  };

  return (
    <PageTransition>
      {/* Banner */}
      <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-800 to-dark-900" />
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <FaEnvelope className="text-5xl text-emerald-300 mx-auto mb-4" />
            <h1 className="font-poppins text-4xl md:text-5xl font-bold text-white mb-3">{t('contact_title')}</h1>
            <p className="text-white/70 text-lg">{t('contact_subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="text-center bg-white rounded-xl p-6 border border-dark-100 hover:shadow-lg transition-shadow duration-300"
              >
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center mx-auto mb-3`}>
                  <card.icon className="text-xl" />
                </div>
                <h4 className="font-poppins font-semibold text-dark-800 mb-1">{card.title}</h4>
                <p className="text-dark-500 text-sm">{card.info}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Form + Map */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div {...fadeInUp}>
              <h3 className="font-poppins font-bold text-2xl text-dark-800 mb-6">{t('contact_form_title')}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('contact_name')} *</label>
                  <input
                    type="text" value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    className={`input-field ${errors.name ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder={t('contact_name')}
                  />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('contact_email')} *</label>
                  <input
                    type="email" value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className={`input-field ${errors.email ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder={t('contact_email')}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('contact_subject')} *</label>
                  <input
                    type="text" value={form.subject}
                    onChange={e => setForm({ ...form, subject: e.target.value })}
                    className={`input-field ${errors.subject ? 'border-red-400 focus:ring-red-400' : ''}`}
                    placeholder={t('contact_subject')}
                  />
                  {errors.subject && <p className="text-red-500 text-xs mt-1">{errors.subject}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('contact_message')} *</label>
                  <textarea
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className={`input-field ${errors.message ? 'border-red-400 focus:ring-red-400' : ''}`}
                    rows="5" placeholder={t('contact_message')}
                  />
                  {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
                </div>
                <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
                  <FaPaperPlane /> {t('contact_send')}
                </button>
              </form>
            </motion.div>

            {/* Map */}
            <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.2 }}>
              <h3 className="font-poppins font-bold text-2xl text-dark-800 mb-6">{t('contact_map_title')}</h3>
              <div className="rounded-2xl overflow-hidden shadow-lg border border-dark-100 h-[400px] lg:h-full min-h-[400px]">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3771.5!2d73.1!3d19.0!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTnCsDAwJzAwLjAiTiA3M8KwMDYnMDAuMCJF!5e0!3m2!1sen!2sin!4v1"
                  width="100%" height="100%" style={{ border: 0 }}
                  allowFullScreen="" loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="School Location"
                  className="w-full h-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Contact;
