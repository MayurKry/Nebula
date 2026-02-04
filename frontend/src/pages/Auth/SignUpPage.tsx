import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, CreditCard, Building2, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const SignUpPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planFromUrl = searchParams.get('plan') || 'starter';

  const { register } = useAuth();

  const [currentStep, setCurrentStep] = useState<'plan' | 'account' | 'details' | 'payment' | 'success'>(
    searchParams.get('plan') ? 'account' : 'plan'
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    industry: '',
    useCase: '',
    plan: planFromUrl
  });

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
  });
  const [paymentErrors, setPaymentErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    }
    return v;
  };

  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;
    if (name === 'cardNumber') formattedValue = formatCardNumber(value);
    if (name === 'expiry') formattedValue = formatExpiry(value);
    if (name === 'cvc') formattedValue = value.replace(/[^0-9]/gi, '').substring(0, 4);

    setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
    // Clear error when user starts typing
    if (paymentErrors[name]) {
      setPaymentErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validatePayment = () => {
    const errors: Record<string, string> = {};
    const cleanCard = paymentData.cardNumber.replace(/\s+/g, '');

    if (cleanCard.length < 16) {
      errors.cardNumber = 'Card number must be 16 digits';
    }

    if (!paymentData.expiry.includes('/')) {
      errors.expiry = 'Use MM/YY format';
    } else {
      const [mm, yy] = paymentData.expiry.split('/');
      const month = parseInt(mm, 10);
      const year = parseInt('20' + yy, 10);
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      if (month < 1 || month > 12) {
        errors.expiry = 'Invalid month';
      } else if (year < currentYear || (year === currentYear && month < currentMonth)) {
        errors.expiry = 'Card has expired';
      }
    }

    if (paymentData.cvc.length < 3) {
      errors.cvc = 'CVC is too short';
    }

    setPaymentErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }
    setError('');
    setCurrentStep('details');
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.industry) {
      setError('Please fill in all mandatory fields');
      return;
    }
    setError('');
    setCurrentStep('payment');
  };

  const handlePaymentSubmit = async () => {
    if (!validatePayment()) {
      toast.error('Please correct the payment errors');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Finalize registration
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        companyName: formData.companyName,
        industry: formData.industry,
        useCase: formData.useCase,
        plan: formData.plan
      });

      // 2. Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      setCurrentStep('success');
      toast.success('Subscription activated successfully!');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'plan':
        return (
          <div className="space-y-6">
            <div className="space-y-2 mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight">Choose Your Plan</h2>
              <p className="text-sm text-gray-500 font-medium">Select a plan to start your creative journey with Nebula.</p>
            </div>

            <div className="space-y-4">
              {[
                { id: 'starter', name: 'Starter', price: '$0', credits: '100', desc: 'Perfect for exploring AI creation' },
                { id: 'creator', name: 'Creator', price: '$79', credits: '1,000', desc: 'For professional creators' },
                { id: 'team', name: 'Team', price: '$249', credits: '5,000', desc: 'For small teams & agencies' }
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setFormData(prev => ({ ...prev, plan: p.id }));
                    setCurrentStep('account');
                  }}
                  className={`w-full p-6 bg-[#141414] border rounded-3xl text-left transition-all hover:scale-[1.02] group relative overflow-hidden ${formData.plan === p.id ? 'border-[#00FF88] shadow-[0_0_30px_rgba(0,255,136,0.1)]' : 'border-white/5 hover:border-white/20'
                    }`}
                >
                  {formData.plan === p.id && (
                    <div className="absolute top-0 right-0 p-3 bg-[#00FF88]/10 rounded-bl-2xl">
                      <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
                    </div>
                  )}
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black text-white capitalize">{p.name}</h3>
                    <div className="text-right">
                      <span className="text-xl font-black text-white">{p.price}</span>
                      <span className="text-[10px] text-gray-500 font-bold block">/mo</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mb-4 line-clamp-1">{p.desc}</p>
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-1 bg-[#00FF88]/10 rounded-lg">
                      <span className="text-[10px] font-black text-[#00FF88] tracking-widest">{p.credits} CREDITS</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 text-center">
              <Link to="/login" className="text-xs font-bold text-gray-500 hover:text-[#00FF88] transition-colors">ALREADY HAVE AN ACCOUNT? LOG IN</Link>
            </div>
          </div>
        );

      case 'account':
        return (
          <form onSubmit={handleAccountSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                required
                className="w-full px-5 py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/50 transition-all text-sm"
              />
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                required
                className="w-full px-5 py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/50 transition-all text-sm"
              />
            </div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              required
              className="w-full px-5 py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/50 transition-all text-sm"
            />
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Set Password"
                required
                className="w-full px-5 py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/50 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              required
              className="w-full px-5 py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00FF88]/50 transition-all text-sm"
            />
            <button type="submit" className="w-full py-4 bg-[#00FF88] text-black font-black rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-xs">
              NEXT: PLAN DETAILS <ArrowRight className="w-4 h-4" />
            </button>
            <div className="text-center">
              <Link to="/login" className="text-xs font-bold text-gray-500 hover:text-[#00FF88] transition-colors">ALREADY HAVE AN ACCOUNT? LOG IN</Link>
            </div>
          </form>
        );

      case 'details':
        return (
          <form onSubmit={handleDetailsSubmit} className="space-y-4">
            <div className="space-y-2 mb-6">
              <h2 className="text-xl font-bold text-white">Complete Your Profile</h2>
              <p className="text-sm text-gray-500">Tell us a bit about how you'll use Nebula.</p>
            </div>
            <div className="space-y-4">
              <div className="relative">
                <Building2 className="absolute left-4 top-4 w-4 h-4 text-gray-600" />
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company/Brand Name"
                  required
                  className="w-full pl-12 pr-5 py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 transition-all text-sm"
                />
              </div>
              <select
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                required
                className="w-full px-5 py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white focus:border-[#00FF88]/50 transition-all text-sm appearance-none"
              >
                <option value="">Select Industry</option>
                <option value="marketing">Marketing Agency</option>
                <option value="content_creation">Content Creation</option>
                <option value="e_commerce">E-Commerce</option>
                <option value="entertainment">Entertainment</option>
                <option value="education">Education</option>
              </select>
              <textarea
                name="useCase"
                value={formData.useCase}
                onChange={handleChange}
                placeholder="What are your goals with Nebula?"
                className="w-full px-5 py-3.5 bg-[#141414] border border-white/5 rounded-2xl text-white placeholder-gray-600 focus:border-[#00FF88]/50 transition-all text-sm min-h-[100px]"
              />
            </div>
            <div className="flex gap-4 pt-2">
              <button type="button" onClick={() => setCurrentStep('account')} className="flex-1 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-all text-xs">BACK</button>
              <button type="submit" className="flex-[2] py-4 bg-[#00FF88] text-black font-black rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-xs">
                CONTINUE TO PAYMENT <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        );

      case 'payment':
        return (
          <div className="space-y-6">
            <div className="bg-[#141414] border border-[#00FF88]/20 rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-3 bg-[#00FF88]/10 rounded-bl-2xl">
                <CheckCircle2 className="w-5 h-5 text-[#00FF88]" />
              </div>
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Selected Plan</h3>
              <div className="text-3xl font-black text-white capitalize mb-4">{formData.plan}</div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">Monthly Subscription</span>
                  <span className="text-white font-bold">
                    {formData.plan === 'starter' ? 'FREE' : formData.plan === 'creator' ? '$79.00' : formData.plan === 'team' ? '$249.00' : 'Custom'}
                  </span>
                </div>
                <div className="flex justify-between text-xs border-t border-white/5 pt-2 mt-2">
                  <span className="text-white font-black">Total Due Now</span>
                  <span className="text-[#00FF88] font-black">
                    {formData.plan === 'starter' ? '$0.00' : formData.plan === 'creator' ? '$79.00' : formData.plan === 'team' ? '$249.00' : 'TBD'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <div className="relative group">
                  <CreditCard className={`absolute left-4 top-4 w-4 h-4 transition-colors ${paymentErrors.cardNumber ? 'text-red-500' : 'text-gray-600 group-focus-within:text-[#00FF88]'}`} />
                  <input
                    type="text"
                    name="cardNumber"
                    value={paymentData.cardNumber}
                    onChange={handlePaymentChange}
                    placeholder="Card Number"
                    className={`w-full pl-12 pr-5 py-3.5 bg-[#141414] border rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all text-sm ${paymentErrors.cardNumber ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#00FF88]/50'}`}
                  />
                </div>
                {paymentErrors.cardNumber && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{paymentErrors.cardNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <input
                    type="text"
                    name="expiry"
                    value={paymentData.expiry}
                    onChange={handlePaymentChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    className={`w-full px-5 py-3.5 bg-[#141414] border rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all text-sm ${paymentErrors.expiry ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#00FF88]/50'}`}
                  />
                  {paymentErrors.expiry && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{paymentErrors.expiry}</p>}
                </div>
                <div className="space-y-1">
                  <input
                    type="text"
                    name="cvc"
                    value={paymentData.cvc}
                    onChange={handlePaymentChange}
                    placeholder="CVC"
                    maxLength={4}
                    className={`w-full px-5 py-3.5 bg-[#141414] border rounded-2xl text-white placeholder-gray-600 focus:outline-none transition-all text-sm ${paymentErrors.cvc ? 'border-red-500/50 focus:border-red-500' : 'border-white/5 focus:border-[#00FF88]/50'}`}
                  />
                  {paymentErrors.cvc && <p className="text-[10px] text-red-500 font-bold ml-2 uppercase">{paymentErrors.cvc}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#00FF88]/5 border border-[#00FF88]/10 rounded-2xl">
                <ShieldCheck className="w-5 h-5 text-[#00FF88]" />
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter leading-tight">Secure Payment Gateway • PCI-DSS Compliant • SSL Encrypted</span>
              </div>
            </div>

            <button
              onClick={handlePaymentSubmit}
              disabled={isLoading}
              className="w-full py-4 bg-[#00FF88] text-black font-black rounded-2xl hover:scale-[1.02] disabled:opacity-50 transition-all flex items-center justify-center gap-3 text-xs"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'CONFIRM & ACTIVATE ACCOUNT'}
            </button>
            <button onClick={() => setCurrentStep('details')} className="w-full text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors">Go Back</button>
          </div>
        );

      case 'success':
        return (
          <div className="text-center space-y-8 py-8 scale-in">
            <div className="w-24 h-24 bg-[#00FF88]/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-[#00FF88]" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white tracking-tight">Welcome to Nebula!</h2>
              <p className="text-gray-400 text-sm">Your creative journey starts now. Your account is active and credits have been allocated.</p>
            </div>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-4 bg-white text-black font-black rounded-2xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 text-xs"
            >
              ENTER DASHBOARD <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col md:flex-row overflow-hidden">
      {/* Left Side: Brand Story */}
      <div className="relative md:w-1/2 h-[30vh] md:h-screen overflow-hidden border-r border-white/5">
        <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover">
          <source src="https://cdn.pixabay.com/video/2016/10/21/6044-188286505_large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20" />

        <div className="absolute inset-0 p-12 flex flex-col justify-between z-10">
          <div>
            <img src="/nebula-logo.png" alt="Nebula" className="h-8 brightness-0 invert" />
          </div>

          <div className="max-w-md space-y-4">
            <div className="px-3 py-1 bg-[#00FF88]/20 border border-[#00FF88]/30 rounded-full inline-block">
              <span className="text-[10px] font-black text-[#00FF88] uppercase tracking-widest">Selected Plan: {formData.plan}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight tracking-tighter">
              The Next Era of <br />
              <span className="text-[#00FF88]">Creative AI.</span>
            </h2>
            <p className="text-base text-gray-300 font-medium opacity-80 leading-relaxed italic">
              "Nebula turned our 3-day production cycle into a 20-minute creative session."
            </p>
          </div>

          <div className="hidden md:flex items-center gap-8 text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">
            <span>STREET CINEMA</span>
            <span>VIRTUAL PRODUCTION</span>
            <span>NEURAL RENDER</span>
          </div>
        </div>
      </div>

      {/* Right Side: Step Form */}
      <div className="md:w-1/2 h-screen flex flex-col bg-[#0A0A0A] z-20 overflow-y-auto custom-scrollbar">
        <div className="flex-1 flex flex-col items-center justify-center p-8 sm:p-16 lg:p-24">
          <div className="w-full max-w-sm space-y-8">

            {/* Step Indicator */}
            {currentStep !== 'success' && (
              <div className="flex items-center justify-between mb-8 opacity-50 px-2 text-center">
                {['Plan', 'Account', 'Profile', 'Payment'].map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${(i === 0 && currentStep === 'plan') ||
                      (i === 1 && currentStep === 'account') ||
                      (i === 2 && currentStep === 'details') ||
                      (i === 3 && currentStep === 'payment') ? 'bg-[#00FF88] ring-4 ring-[#00FF88]/20' : 'bg-gray-800'
                      }`} />
                    <span className="text-[9px] font-black uppercase tracking-widest text-white">{step}</span>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs font-bold uppercase tracking-wider">
                {error}
              </div>
            )}

            {renderStep()}

          </div>
        </div>

        <div className="p-8 text-center bg-[#0A0A0A]/50 border-t border-white/5">
          <p className="text-[10px] text-gray-700 font-bold uppercase tracking-[.2em]">© 2026 Nebula Creative Cloud. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
