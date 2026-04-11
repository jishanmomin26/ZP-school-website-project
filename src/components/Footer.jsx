import { Link } from 'react-router-dom';
import { FaSchool, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope, FaFacebook, FaTwitter, FaInstagram, FaYoutube, FaHeart } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const Footer = () => {
  const { t } = useLanguage();

  const quickLinks = [
    { path: '/', label: t('nav_home') },
    { path: '/about', label: t('nav_about') },
    { path: '/donate', label: t('nav_donate') },
    { path: '/help', label: t('nav_help') },
    { path: '/contact', label: t('nav_contact') },
    { path: '/login', label: t('nav_login') },
  ];

  return (
    <footer className="bg-dark-900 text-white">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* School Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center">
                <FaSchool className="text-white text-xl" />
              </div>
              <h3 className="font-poppins font-bold text-xl">{t('nav_school_name')}</h3>
            </div>
            <p className="text-dark-300 text-sm leading-relaxed max-w-md mb-6">
              {t('footer_about')}
            </p>
            <div className="flex gap-3">
              {[FaFacebook, FaTwitter, FaInstagram, FaYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 bg-dark-800 rounded-lg flex items-center justify-center text-dark-400 hover:bg-primary-600 hover:text-white transition-all duration-300"
                >
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">{t('footer_quick_links')}</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-dark-400 hover:text-primary-400 text-sm transition-colors duration-200 hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-poppins font-semibold text-lg mb-4">{t('footer_contact_info')}</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-dark-400 text-sm">
                <FaMapMarkerAlt className="text-primary-400 mt-0.5 flex-shrink-0" />
                <span>{t('footer_address')}</span>
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <FaPhoneAlt className="text-primary-400 flex-shrink-0" />
                <span>{t('footer_phone')}</span>
              </li>
              <li className="flex items-center gap-3 text-dark-400 text-sm">
                <FaEnvelope className="text-primary-400 flex-shrink-0" />
                <span>{t('footer_email')}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-dark-500 text-sm">
            © {new Date().getFullYear()} {t('nav_school_name')}. {t('footer_rights')}.
          </p>
          <p className="text-dark-500 text-sm flex items-center gap-1.5">
            {t('footer_made_with')}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
