import LegalPageLayout from './LegalPageLayout';

const PrivacyPolicy = () => {
    return (
        <LegalPageLayout title="Privacy Policy" lastUpdated="December 24, 2025">
            <p>At Nebula, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclosure, and safeguard your information when you visit our website and use our AI video generation services.</p>

            <h3>1. Information We Collect</h3>
            <p>We collect information that you strictly provide to us when registering, such as name, email address, and payment information. We also collect data related to your usage of our AI tools, including prompts and generated content, to improve our services.</p>

            <h3>2. How We Use Your Information</h3>
            <p>We use the information we collect to operate, maintain, and provide the features of the Nebula platform. We may also use the data to communicate with you, monitor usage patterns, and protect against fraudulent or illegal activity.</p>

            <h3>3. Data Security</h3>
            <p>We implement appropriate technical and organizational security measures designed to protect the security of any personal information we process. However, please also remember that we cannot guarantee that the internet itself is 100% secure.</p>

            <h3>4. Your Data Rights</h3>
            <p>Depending on your location, you may have rights regarding your personal data, including the right to access, correct, or delete your data. Contact our support team to exercise these rights.</p>
        </LegalPageLayout>
    );
};

export default PrivacyPolicy;
