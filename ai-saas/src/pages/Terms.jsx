import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  Shield, FileText, ArrowLeft, Cpu, CheckCircle2, AlertTriangle, 
  CreditCard, Scale, Lock, RefreshCw, Mail 
} from "lucide-react";

const sections = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "accounts", title: "2. User Accounts & Eligibility" },
  { id: "acceptable-use", title: "3. Acceptable Use Policy" },
  { id: "ai-ownership", title: "4. AI Output & Intellectual Property" },
  { id: "billing-refunds", title: "5. Subscriptions, Credits & Refunds" },
  { id: "availability", title: "6. Service Availability & Limits" },
  { id: "third-party", title: "7. Third-Party AI Providers" },
  { id: "liability", title: "8. Limitation of Liability & Disclaimers" },
  { id: "termination", title: "9. Account Termination" },
  { id: "governing-law", title: "10. Governing Law & Contact" },
];

export default function Terms() {
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

          <div style={{ width: 110 }} />
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
            <Scale size={13} />
            <span>LEGAL DOCUMENTATION</span>
          </div>
          <h1 className="legal-title">Terms of Service</h1>
          <p className="legal-subtitle">
            Please read these terms carefully before using AISaaS. These terms govern your access to and use of our AI creative platform, software tools, and subscription services.
          </p>
          <div className="legal-meta">
            <span>Last Updated: October 9, 2025</span>
            <span>•</span>
            <span>Effective Version: 2.4</span>
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
                <Shield size={20} color="#c4b5fd" />
                <h4>Questions about our Terms?</h4>
                <p>Our compliance team is here to assist with any legal inquiries.</p>
                <a href="mailto:support@aisaas.com" className="legal-sidebar-email">
                  <Mail size={13} />
                  <span>support@aisaas.com</span>
                </a>
              </div>
            </div>
          </aside>

          {/* Document Content */}
          <article className="legal-body">
            {/* Section 1 */}
            <section id="acceptance" className="legal-section">
              <h2>1. Acceptance of Terms</h2>
              <p>
                By creating an account, purchasing a subscription, or otherwise utilizing any application or service provided by AISaaS (&quot;Company&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;), you acknowledge that you have read, understood, and agree to be legally bound by these Terms of Service, along with our <Link to="/privacy">Privacy Policy</Link>.
              </p>
              <p>
                If you do not agree with any part of these terms, you must not access or use the platform.
              </p>
              <div className="legal-callout">
                <CheckCircle2 size={18} className="legal-callout-icon" />
                <div>
                  <strong>Binding Agreement:</strong> Using AISaaS signifies your express acceptance of these terms. If you are using the platform on behalf of an enterprise or organization, you confirm you have authority to bind that entity.
                </div>
              </div>
            </section>

            {/* Section 2 */}
            <section id="accounts" className="legal-section">
              <h2>2. User Accounts & Eligibility</h2>
              <p>
                To access features of the platform, you must register for an account by providing accurate, complete, and updated information. You are solely responsible for:
              </p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials and password.</li>
                <li>All activities, generations, and API transactions conducted under your credentials.</li>
                <li>Promptly notifying us of any unauthorized account compromise or breach.</li>
              </ul>
              <p>
                You must be at least 18 years old or the age of legal majority in your jurisdiction to use AISaaS.
              </p>
            </section>

            {/* Section 3 */}
            <section id="acceptable-use" className="legal-section">
              <h2>3. Acceptable Use & AI Safety Policy</h2>
              <p>
                AISaaS provides advanced generative AI tools for writing, code generation, graphic creation, and audio translation. You agree strictly not to use our services to generate, process, or disseminate:
              </p>
              <ul>
                <li>Content that is unlawful, defamatory, harassing, sexually explicit, or promoting violence or hate speech.</li>
                <li>Malicious software, exploit payloads, phishing scams, or automated cyberattacks.</li>
                <li>Misinformation, deceptive synthetic media (deepfakes) intended to defraud or impersonate others without consent.</li>
                <li>Material that violates third-party copyrights, trademarks, or proprietary trade secrets.</li>
                <li>High-risk applications including automated medical diagnostics, autonomous weapons, or critical infrastructure control.</li>
              </ul>
              <div className="legal-callout alert">
                <AlertTriangle size={18} className="legal-callout-icon alert-icon" />
                <div>
                  <strong>Zero-Tolerance Policy:</strong> Any generation violating acceptable use guidelines will result in immediate suspension, token forfeiture, and reporting to relevant authorities where required by law.
                </div>
              </div>
            </section>

            {/* Section 4 */}
            <section id="ai-ownership" className="legal-section">
              <h2>4. AI Output & Intellectual Property Rights</h2>
              <p>
                <strong>Ownership of Generated Content:</strong> As between you and AISaaS, and to the extent permitted by applicable law, you own the inputs you provide and the outputs generated by our AI models based on your prompts.
              </p>
              <p>
                <strong>Commercial Rights:</strong> Subscribed users (Starter, Pro, and Enterprise tiers) receive full commercial rights to use, publish, sell, and distribute outputs created on the platform.
              </p>
              <p>
                <strong>Platform IP:</strong> The AISaaS website, design system, trademarks, APIs, underlying software algorithms, and proprietary workflows remain the exclusive intellectual property of AISaaS Inc.
              </p>
            </section>

            {/* Section 5 */}
            <section id="billing-refunds" className="legal-section">
              <h2>5. Subscriptions, Credits & Refund Policy</h2>
              <p>
                We offer both free tier generation quotas and premium paid plans (Starter, Pro, Enterprise) processed securely through verified payment gateways (including Razorpay and Stripe):
              </p>
              <ul>
                <li><strong>Billing Cycle:</strong> Paid subscriptions are billed on a recurring monthly or annual basis depending on your selected tier.</li>
                <li><strong>Credit Consumption:</strong> Each AI task (content generation, image synthesis, audio transcription) deducts allocated credits from your plan balance.</li>
                <li><strong>Cancellation:</strong> You may cancel or downgrade your subscription at any time via the Billing portal. Cancellation takes effect at the end of the current billing cycle.</li>
                <li><strong>Refund Policy:</strong> Due to computational costs incurred by generative AI models, purchases of credit packs and subscription fees are non-refundable once AI credits have been utilized. If you encounter a technical billing error, contact support within 7 days of the charge.</li>
              </ul>
              <div className="legal-callout">
                <CreditCard size={18} className="legal-callout-icon" />
                <div>
                  <strong>Secure Transactions:</strong> AISaaS never stores your full credit card number or bank credentials. All transactions are tokenized and encrypted by PCI-DSS certified payment processors.
                </div>
              </div>
            </section>

            {/* Section 6 */}
            <section id="availability" className="legal-section">
              <h2>6. Service Availability & Rate Limits</h2>
              <p>
                We strive for 99.9% platform availability. However, we do not warrant that service operations will be uninterrupted or error-free. We implement rate limits and fair-usage throttling to prevent abuse and maintain system stability for all users.
              </p>
            </section>

            {/* Section 7 */}
            <section id="third-party" className="legal-section">
              <h2>7. Third-Party AI Providers</h2>
              <p>
                Our platform incorporates state-of-the-art foundation models provided by third parties (including OpenAI, Anthropic, Stability AI, and Hugging Face). By using these specific generation tools, you also acknowledge compliance with each provider&apos;s published policies.
              </p>
            </section>

            {/* Section 8 */}
            <section id="liability" className="legal-section">
              <h2>8. Limitation of Liability & Disclaimers</h2>
              <p>
                AISaaS is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. Generative artificial intelligence may occasionally produce inaccurate, misleading, or offensive content (hallucinations). You are solely responsible for verifying and reviewing the accuracy of AI-generated results before relying on them.
              </p>
              <p>
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, AISAAS INC. SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF PROFITS, DATA, OR BUSINESS REPUTATION ARISING FROM YOUR USE OF THE SERVICE.
              </p>
            </section>

            {/* Section 9 */}
            <section id="termination" className="legal-section">
              <h2>9. Account Termination</h2>
              <p>
                We reserve the right to suspend or terminate your account at our discretion without prior notice if you violate these Terms of Service or engage in fraudulent, abusive, or harmful behavior. You may close your account at any time through your dashboard settings.
              </p>
            </section>

            {/* Section 10 */}
            <section id="governing-law" className="legal-section">
              <h2>10. Governing Law & Contact</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which AISaaS operates, without regard to conflict of law principles.
              </p>
              <div className="legal-contact-box">
                <Mail size={20} color="#a78bfa" />
                <div>
                  <h4>Have questions or need assistance?</h4>
                  <p>Reach out to our legal and customer support team at <a href="mailto:legal@aisaas.com">legal@aisaas.com</a> or <a href="mailto:support@aisaas.com">support@aisaas.com</a>.</p>
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
