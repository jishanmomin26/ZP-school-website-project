import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../Firebase/config';
import {
  FaGraduationCap,
  FaHeart,
  FaBuilding,
  FaHandHoldingHeart
} from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';
import PageTransition from '../components/PageTransition';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 }
};

const Donate = () => {
  const { t } = useLanguage();

  const initialForm = {
    name: '',
    phone: '',
    purpose: '',
    message: ''
  };

  const [form, setForm] = useState(initialForm);

  const purposes = [
    { value: 'books', label: 'Books & Study Materials' },
    { value: 'uniform', label: 'Uniforms & Bags' },
    { value: 'stationery', label: 'Stationery Items' },
    { value: 'sports', label: 'Sports Equipment' },
    { value: 'other', label: 'Other Support' }
  ];

  const whyDonate = [
    {
      icon: FaGraduationCap,
      title: t('donate_why_1_title'),
      desc: t('donate_why_1_desc'),
      color: 'from-blue-500 to-blue-700'
    },
    {
      icon: FaHeart,
      title: t('donate_why_2_title'),
      desc: t('donate_why_2_desc'),
      color: 'from-rose-500 to-rose-700'
    },
    {
      icon: FaBuilding,
      title: t('donate_why_3_title'),
      desc: t('donate_why_3_desc'),
      color: 'from-emerald-500 to-emerald-700'
    }
  ];

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.phone || !form.purpose) {
      toast.error('Please fill all required fields');
      return;
    }

    if (form.phone.length < 10) {
      toast.error('Enter valid phone number');
      return;
    }

    try {
      await addDoc(collection(db, "donations"), {
        ...form,
        date: new Date().toISOString(),
        status: "pending"
      });

      toast.success("Request submitted! School will contact you.");

      setForm(initialForm);

    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <FaHandHoldingHeart className="text-5xl text-accent-400 mx-auto mb-4" />
            <h1 className="font-poppins text-4xl md:text-5xl font-bold text-white mb-3">
              Support Our School
            </h1>
            <p className="text-white/70 text-lg">
              Donate study materials and help students build a better future
            </p>
          </motion.div>
        </div>
      </section>

      {/* Info + Form */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

            {/* Donation Info */}
            <motion.div {...fadeInUp} className="text-center">
              <div className="bg-dark-50 rounded-2xl p-8 border border-dark-100">
                <h3 className="font-poppins font-bold text-xl text-dark-800 mb-3">
                  Donate Materials
                </h3>

                <p className="text-dark-600 mb-4">
                  Our school accepts donations in the form of useful materials for students.
                </p>

                <div className="bg-white rounded-xl p-6 border border-dashed border-dark-200">
                  <p className="text-dark-700 font-medium mb-2">
                    📚 You Can Donate:
                  </p>
                  <ul className="text-sm text-dark-500 space-y-1">
                    <li>• Books & Study Materials</li>
                    <li>• School Bags & Uniforms</li>
                    <li>• Stationery Items</li>
                    <li>• Sports Equipment</li>
                  </ul>
                </div>

                <p className="mt-4 text-dark-600 text-sm">
                  Submit the form and our team will contact you.
                </p>
              </div>
            </motion.div>

            {/* Form */}
            <motion.div {...fadeInUp}>
              <h3 className="font-poppins font-bold text-xl text-dark-800 mb-6">
                Donation Request Form
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">

                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Your Name"
                  className="input-field"
                  required
                />

                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Phone Number"
                  className="input-field"
                  required
                />

                <select
                  name="purpose"
                  value={form.purpose}
                  onChange={handleChange}
                  className="input-field"
                  required
                >
                  <option value="">Select Donation Type</option>
                  {purposes.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>

                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Additional Message (optional)"
                  className="input-field"
                  rows="3"
                />

                <button
                  type="submit"
                  className="btn-accent w-full flex items-center justify-center gap-2"
                >
                  <FaHandHoldingHeart />
                  Submit Request
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
                className="text-center bg-white rounded-2xl p-8 border border-dark-100 hover:shadow-xl transition"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                  <item.icon className="text-white text-2xl" />
                </div>

                <h4 className="font-poppins font-bold text-lg text-dark-800 mb-3">
                  {item.title}
                </h4>
                <p className="text-dark-500 text-sm">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </PageTransition>
  );
};

export default Donate;