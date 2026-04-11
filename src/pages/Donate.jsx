import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { FaQrcode, FaGraduationCap, FaHeart, FaBuilding, FaHandHoldingHeart } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import PageTransition from '../components/PageTransition';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-50px" },
  transition: { duration: 0.5 }
};

const Donate = () => {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', phone: '', amount: '', purpose: '', message: '' });

  const purposes = [
    { value: 'sports', label: t('donate_purpose_sports') },
    { value: 'meal', label: t('donate_purpose_meal') },
    { value: 'books', label: t('donate_purpose_books') },
    { value: 'materials', label: t('donate_purpose_materials') },
    { value: 'welfare', label: t('donate_purpose_welfare') },
  ];

  const whyDonate = [
    { icon: FaGraduationCap, title: t('donate_why_1_title'), desc: t('donate_why_1_desc'), color: 'from-blue-500 to-blue-700' },
    { icon: FaHeart, title: t('donate_why_2_title'), desc: t('donate_why_2_desc'), color: 'from-rose-500 to-rose-700' },
    { icon: FaBuilding, title: t('donate_why_3_title'), desc: t('donate_why_3_desc'), color: 'from-emerald-500 to-emerald-700' },
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.amount || !form.purpose) {
      toast.error('Please fill all required fields');
      return;
    }
    // Save to localStorage
    const donations = JSON.parse(localStorage.getItem('zpkudave_donations') || '[]');
    donations.push({ ...form, date: new Date().toISOString() });
    localStorage.setItem('zpkudave_donations', JSON.stringify(donations));
    
    toast.success(t('donate_success'), { duration: 4000 });
    setForm({ name: '', phone: '', amount: '', purpose: '', message: '' });
  };

  return (
    <PageTransition>
      {/* Banner */}
      <section className="relative h-[40vh] min-h-[320px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-700 via-primary-800 to-dark-900" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-accent-400 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 text-center px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <FaHandHoldingHeart className="text-5xl text-accent-400 mx-auto mb-4" />
            <h1 className="font-poppins text-4xl md:text-5xl font-bold text-white mb-3">{t('donate_title')}</h1>
            <p className="text-white/70 text-lg">{t('donate_subtitle')}</p>
          </motion.div>
        </div>
      </section>

      {/* QR Code + Form */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* QR Code */}
            <motion.div {...fadeInUp} className="text-center">
              <div className="bg-dark-50 rounded-2xl p-8 border border-dark-100">
                <h3 className="font-poppins font-bold text-xl text-dark-800 mb-2">{t('donate_qr_title')}</h3>
                <p className="text-dark-500 text-sm mb-6">{t('donate_qr_subtitle')}</p>
                <div className="w-64 h-64 bg-white rounded-xl mx-auto flex items-center justify-center border-2 border-dashed border-dark-200 mb-4">
                  <div className="text-center">
                    <FaQrcode className="text-7xl text-dark-300 mx-auto mb-3" />
                    <p className="text-dark-400 text-sm font-medium">UPI QR Code</p>
                    <p className="text-dark-300 text-xs">Scan to Pay</p>
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium">
                  <span>UPI ID: zpkudave@upi</span>
                </div>
              </div>
            </motion.div>

            {/* Donation Form */}
            <motion.div {...fadeInUp} transition={{ duration: 0.5, delay: 0.2 }}>
              <h3 className="font-poppins font-bold text-xl text-dark-800 mb-6">{t('donate_form_title')}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('donate_name')} *</label>
                  <input
                    type="text" name="name" value={form.name} onChange={handleChange}
                    className="input-field" placeholder={t('donate_name')} required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('donate_phone')} *</label>
                  <input
                    type="tel" name="phone" value={form.phone} onChange={handleChange}
                    className="input-field" placeholder="+91 9876543210" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('donate_amount')} *</label>
                  <input
                    type="number" name="amount" value={form.amount} onChange={handleChange}
                    className="input-field" placeholder="500" min="1" required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('donate_purpose')} *</label>
                  <select
                    name="purpose" value={form.purpose} onChange={handleChange}
                    className="input-field" required
                  >
                    <option value="">{t('donate_purpose_select')}</option>
                    {purposes.map(p => (
                      <option key={p.value} value={p.value}>{p.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-dark-700 mb-1.5">{t('donate_message')}</label>
                  <textarea
                    name="message" value={form.message} onChange={handleChange}
                    className="input-field" rows="3" placeholder={t('donate_message')}
                  />
                </div>
                <button type="submit" className="btn-accent w-full text-center flex items-center justify-center gap-2">
                  <FaHandHoldingHeart />
                  {t('donate_submit')}
                </button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Donate */}
      <section className="py-20 bg-dark-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeInUp} className="text-center mb-14">
            <h2 className="section-title">{t('donate_why_title')}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {whyDonate.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center bg-white rounded-2xl p-8 border border-dark-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg`}>
                  <item.icon className="text-white text-2xl" />
                </div>
                <h4 className="font-poppins font-bold text-lg text-dark-800 mb-3">{item.title}</h4>
                <p className="text-dark-500 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Donate;
