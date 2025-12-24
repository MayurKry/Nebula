import LegalPageLayout from './LegalPageLayout';
import { Shield, Lock, FileCheck } from 'lucide-react';

const Security = () => {
    return (
        <LegalPageLayout title="Security & Compliance" lastUpdated="December 24, 2025">
            <p>At Nebula, security is not just a feature; it is the foundation of our platform. We are committed to protecting your creative assets and data with enterprise-grade security.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 not-prose">
                <div className="bg-[#141414] border border-white/10 p-6 rounded-xl text-center">
                    <Shield className="w-8 h-8 mx-auto text-purple-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">SOC 2 Type II</h3>
                    <p className="text-sm text-gray-500">Audited and verified for security, availability, and confidentiality.</p>
                </div>
                <div className="bg-[#141414] border border-white/10 p-6 rounded-xl text-center">
                    <Lock className="w-8 h-8 mx-auto text-blue-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">GDPR Compliant</h3>
                    <p className="text-sm text-gray-500">Fully compliant with European data protection regulations.</p>
                </div>
                <div className="bg-[#141414] border border-white/10 p-6 rounded-xl text-center">
                    <FileCheck className="w-8 h-8 mx-auto text-green-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">ISO 27001</h3>
                    <p className="text-sm text-gray-500">Certified information security management systems.</p>
                </div>
            </div>

            <h3>Infrastructure Security</h3>
            <p>Run on AWS and Google Cloud with multi-region redundancy, VPC isolation, and DDoS protection.</p>

            <h3>Data Encryption</h3>
            <p>All data is encrypted in transit using TLS 1.3 and at rest using AES-256 encryption keys.</p>

            <h3>Access Control</h3>
            <p>We employ strict Role-Based Access Control (RBAC) and Multi-Factor Authentication (MFA) for all internal systems.</p>
        </LegalPageLayout>
    );
};

export default Security;
