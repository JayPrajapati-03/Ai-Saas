import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, ArrowLeft, Cpu, CheckCircle2, Lock, Eye, Database, 
  Server, Globe, Mail, Printer, Key 
} from "lucide-react";

const sections = [
  { id: "collection", title: "1. Information We Collect" },
  { id: "ai-data", title: "2. AI Prompts & Training Data Policy" },
  { id: "usage", title: "3. How We Use Your Information" },
  { id: "sharing", title: "4. Data Sharing & Third Parties" },
  { id: "security", title: "5. Security & Encryption Standards" },
  { id: "retention", title: "6. Data Retention & Deletion" },
  { id: "rights", title: "7. Your Privacy Rights (GDPR / CCPA)" },
  { id: "cookies", title: "8. Cookies & Tracking Technologies" },
  { id: "contact", title: "9. Contact Us" },
];

export default function Privacy() {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="legal-page-container">
      <div className="mesh-bg" />

      {/* Top Navigation Bar */}
      <header className="legal-header">
        <div className="legal-header-inner">
          <Link to="/" className="legal-back-btn">
            <ArrowLeft size={16} />
            <span>Back to Home</span>
          </Link>

          <Link to="/" className="legal-brand" style={{ textDecoration: "none" }}>
            <div className="landing-logo-icon" style={{ width: 34, height: 34 }}>
              <Cpu size={16} color="white" />
            </div>
            <span style={{ fontFamily: "var(--font-heading)", fontSize: 20, fontWeight: 700, color: "white" }}>
              AI<span className="gradient-text">SaaS</span>
            </span>
          </Link>

          <button onClick={handlePrint} className="legal-print-btn" title="Print Policy">
            <Printer size={15} />
            <span>Print</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="legal-main">
        {/* Hero Banner */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="legal-hero"
        >
          <div className="landing-section-badge" style={{ marginBottom: 12 }}>
            <Shield size={13} />
            <span>PRIVACY & SECURITY</span>
          </div>
          <h1 className="legal-title">Privacy Policy</h1>
          <p className="legal-subtitle">
            At AISaaS, we believe privacy is a fundamental right. Learn how we handle your personal data, AI prompt inputs, and security practices with complete transparency.
          </p>
          <div className="legal-meta">
            <span>Last Updated: October 9, 2025</span>
            <span>•</span>
            <span>GDPR & DPDP Compliant</span>
          </div>
        </motion.div>

        <div className="legal-layout">
          {/* Quick Nav Sidebar */}
          <aside className="legal-sidebar">
            <div className="legal-sidebar-sticky">
              <h3 className="legal-sidebar-title">Table of Contents</h3>
              <nav className="legal-sidebar-nav">
                {sections.map(({ id, title }) => (
                  <a key={id} href={`#${id}`} className="legal-sidebar-link">
                    {title}
                  </a>
                ))}
              </nav>

              <div className="legal-sidebar-card">
                <Lock size={20} color="#34d399" />
                <h4>Privacy-First Architecture</h4>
                <p>We do not sell personal data or use private inputs to train public foundational models.</p>
                <Link to="/terms" className="legal-sidebar-email">
                  <span>View Terms of Service →</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Document Content */}
          <article className="legal-body">
            {/* Section 1 */}
            <section id="collection" className="legal-section">
              <h2>1. Information We Collect</h2>
              <p>
                We collect information to provide, personalize, and improve our services when you interact with our platform:
              </p>
              <ul>
                <li><strong>Account Information:</strong> Name, email address, password hash, and profile preferences collected upon sign-up.</li>
                <li><strong>Usage & Generation Data:</strong> Text prompts, input documents for summarization, audio files submitted for transcription, and output history.</li>
                <li><strong>Billing & Payment Data:</strong> Transaction identifiers, selected tier, and invoice records handled via secure gateways like Razorpay. We do not store raw card credentials on our servers.</li>
                <li><strong>Technical Logs:</strong> IP address, browser type, device diagnostics, and performance telemetry to detect fraud and ensure system stability.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section id="ai-data" className="legal-section">
              <h2>2. AI Prompts & Training Data Policy</h2>
              <p>
                We recognize that your creative ideas and enterprise materials are sensitive and confidential.
              </p>
              <div className="legal-callout">
                <CheckCircle2 size={18} className="legal-callout-icon" />
                <div>
                  <strong>Zero Public Model Training:</strong> AISaaS does not sell your prompts or generation outputs to data brokers, nor do we use your private content to train foundational AI models without your explicit opt-in consent.
                </div>
              </div>
              <p>
                Your prompt data is processed strictly via enterprise API channels with zero-data-retention agreements where applicable with third-party providers.
              </p>
            </section>

            {/* Section 3 */}
            <section id="usage" className="legal-section">
              <h2>3. How We Use Your Information</h2>
              <p>
                We use collected information solely for valid operational purposes:
              </p>
              <ul>
                <li>To execute your requested AI generation tasks (writing, summarizing, translating, and image generation).</li>
                <li>To manage your credit balances, plan renewals, and payment receipts.</li>
                <li>To detect and prevent fraudulent account activities, automated bots, and abusive content.</li>
                <li>To provide customer support and service notifications.</li>
              </ul>
            </section>

            {/* Section 4 */}
            <section id="sharing" className="legal-section">
              <h2>4. Data Sharing & Third-Party Service Providers</h2>
              <p>
                We only share data with trusted infrastructure and service providers bound by strict confidentiality and data protection agreements:
              </p>
              <ul>
                <li><strong>Payment Processors:</strong> Razorpay and Stripe for secure billing processing.</li>
                <li><strong>Cloud Infrastructure:</strong> High-security cloud hosting and database systems with end-to-end encryption.</li>
                <li><strong>AI Model Inference Providers:</strong> Upstream foundation model APIs used solely to process requested completions.</li>
              </ul>
              <p>We do not sell, rent, or trade your personal information to advertisers.</p>
            </section>

            {/* Section 5 */}
            <section id="security" className="legal-section">
              <h2>5. Security & Encryption Standards</h2>
              <p>
                We implement industry-leading technical and organizational safeguards to protect your personal data, including:
              </p>
              <ul>
                <li>TLS 1.3 encryption in transit for all data transferred between your browser and our servers.</li>
                <li>AES-256 encryption at rest for stored records and sensitive tokens.</li>
                <li>Salted bcrypt password hashing to safeguard user credentials.</li>
                <li>Continuous monitoring, rate limiting, and automated vulnerability scanning.</li>
              </ul>
            </section>

            {/* Section 6 */}
            <section id="retention" className="legal-section">
              <h2>6. Data Retention & Account Deletion</h2>
              <p>
                We retain your account details and history records only as long as your account remains active. You can delete individual generation history items directly from your dashboard or request full account deletion at any time.
              </p>
            </section>

            {/* Section 7 */}
            <section id="rights" className="legal-section">
              <h2>7. Your Privacy Rights (GDPR, CCPA & DPDP)</h2>
              <p>
                Regardless of where you reside, you have the right to:
              </p>
              <ul>
                <li>Request access to the personal data we hold about you.</li>
                <li>Request correction of inaccurate information or deletion of your records.</li>
                <li>Export your generation history in a portable format.</li>
                <li>Opt out of marketing communications at any time.</li>
              </ul>
            </section>

            {/* Section 8 */}
            <section id="cookies" className="legal-section">
              <h2>8. Cookies & Local Storage</h2>
              <p>
                We utilize essential cookies and browser local storage exclusively to maintain user authentication sessions and system theme preferences. We do not employ third-party cross-site advertising trackers.
              </p>
            </section>

            {/* Section 9 */}
            <section id="contact" className="legal-section">
              <h2>9. Contact Our Data Protection Team</h2>
              <p>
                If you have questions regarding this Privacy Policy or wish to exercise your data privacy rights, please contact our team:
              </p>
              <div className="legal-contact-box">
                <Mail size={20} color="#34d399" />
                <div>
                  <h4>Data Protection Office</h4>
                  <p>Email: <a href="mailto:privacy@aisaas.com">privacy@aisaas.com</a> • Address: AISaaS Inc., Tech Park, Suite 400</p>
                </div>
              </div>
            </section>
          </article>
        </div>
      </main>

      {/* Footer */}
      <footer className="landing-footer-bottom" style={{ marginTop: 60 }}>
        <div className="landing-footer-bottom-container">
          <div className="landing-footer-bottom-left">
            <p>© 2025 AISaaS Inc. All rights reserved.</p>
          </div>
          <div className="landing-footer-bottom-links">
            <Link to="/terms">Terms of Service</Link>
            <span className="landing-footer-dot">•</span>
            <Link to="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
