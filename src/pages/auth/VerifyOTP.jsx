import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

const VerifyOTP = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { verifyOTP, resendOTP } = useAuth();

  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const type = searchParams.get('type') || 'email';

  const [otp, setOtp] = useState(
    Array(OTP_LENGTH).fill('')
  );

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] =
    useState(RESEND_SECONDS);

  const inputRefs = useRef([]);

  const destination =
    type === 'phone' ? phone : email;

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (secondsLeft <= 0) return;

    const timer = setInterval(() => {
      setSecondsLeft((prev) =>
        prev > 0 ? prev - 1 : 0
      );
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const handleChange = (index, value) => {
    const cleanValue = value
      .replace(/\D/g, '')
      .slice(-1);

    const nextOTP = [...otp];
    nextOTP[index] = cleanValue;

    setOtp(nextOTP);
    setError('');
    setSuccess('');

    if (
      cleanValue &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (
      event.key === 'Backspace' &&
      !otp[index] &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === 'ArrowLeft' &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }

    if (
      event.key === 'ArrowRight' &&
      index < OTP_LENGTH - 1
    ) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pasted = event.clipboardData
      .getData('text')
      .replace(/\D/g, '')
      .slice(0, OTP_LENGTH);

    if (!pasted) return;

    const nextOTP = Array(OTP_LENGTH).fill('');

    pasted
      .split('')
      .forEach((digit, index) => {
        nextOTP[index] = digit;
      });

    setOtp(nextOTP);
    setError('');

    const focusIndex = Math.min(
      pasted.length,
      OTP_LENGTH - 1
    );

    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const otpValue = otp.join('');

    if (otpValue.length !== OTP_LENGTH) {
      setError(
        `Please enter the ${OTP_LENGTH}-digit verification code.`
      );
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        otp: otpValue,
        type,
      };

      if (email) {
        payload.email = email;
      }

      if (phone) {
        payload.phone = phone;
      }

      const response = await verifyOTP(payload);

      if (response?.success === false) {
        throw new Error(
          response.message ||
            'Invalid verification code.'
        );
      }

      setSuccess(
        response?.message ||
          'Verification successful.'
      );

      setTimeout(() => {
        if (
          response?.redirectTo
        ) {
          navigate(
            response.redirectTo,
            { replace: true }
          );
        } else {
          navigate('/dashboard', {
            replace: true,
          });
        }
      }, 800);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Invalid or expired verification code.'
      );
      setOtp(Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (secondsLeft > 0 || resending) {
      return;
    }

    if (!destination) {
      setError(
        'Email address or phone number is required.'
      );
      return;
    }

    setResending(true);
    setError('');
    setSuccess('');

    try {
      const payload =
        type === 'phone'
          ? {
              phone,
              type: 'phone',
            }
          : {
              email,
              type: 'email',
            };

      const response =
        await resendOTP(payload);

      if (response?.success === false) {
        throw new Error(
          response.message ||
            'Unable to resend verification code.'
        );
      }

      setOtp(Array(OTP_LENGTH).fill(''));
      setSecondsLeft(RESEND_SECONDS);

      setSuccess(
        response?.message ||
          'A new verification code has been sent.'
      );

      inputRefs.current[0]?.focus();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Unable to resend verification code.'
      );
    } finally {
      setResending(false);
    }
  };

  const maskedDestination = () => {
    if (type === 'phone' && phone) {
      if (phone.length <= 4) return phone;

      return `${'*'.repeat(
        Math.max(0, phone.length - 4)
      )}${phone.slice(-4)}`;
    }

    if (email) {
      const [username, domain] =
        email.split('@');

      if (!domain) return email;

      const visible =
        username.length > 2
          ? username.slice(0, 2)
          : username.slice(0, 1);

      return `${visible}${'*'.repeat(
        Math.max(2, username.length - visible.length)
      )}@${domain}`;
    }

    return '';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Branding */}
        <div className="hidden w-1/2 bg-blue-600 p-12 lg:flex lg:flex-col lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-xl font-bold text-blue-600">
              A
            </div>

            <span className="text-2xl font-bold text-white">
              Brielix
            </span>
          </div>

          <div className="max-w-lg">
            <p className="mb-4 text-sm font-medium uppercase tracking-wider text-blue-100">
              Secure Verification
            </p>

            <h1 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
              One more step to secure your account.
            </h1>

            <p className="mt-6 text-base leading-7 text-blue-100">
              Enter the verification code sent
              to your registered contact to
              continue securely.
            </p>

            <div className="mt-8 space-y-4">
              {[
                'Secure account verification',
                'One-time verification code',
                'Protected business access',
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-3 text-sm text-white"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/15">
                    <svg
                      className="h-3.5 w-3.5"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m5 12 4 4L19 6"
                      />
                    </svg>
                  </span>

                  {item}
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-blue-100">
            © {new Date().getFullYear()} Brielix.
            All rights reserved.
          </p>
        </div>

        {/* OTP */}
        <div className="flex w-full items-center justify-center px-5 py-10 sm:px-8 lg:w-1/2">
          <div className="w-full max-w-md">
            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-lg font-bold text-white">
                A
              </div>

              <span className="text-xl font-bold text-gray-900">
                Brielix
              </span>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm sm:p-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <rect
                    x="3"
                    y="5"
                    width="18"
                    height="14"
                    rx="2"
                  />

                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m3 7 9 6 9-6"
                  />
                </svg>
              </div>

              <h1 className="mt-6 text-2xl font-bold text-gray-900">
                Verify your {type === 'phone' ? 'phone' : 'email'}
              </h1>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-gray-500">
                Enter the 6-digit code we sent to
              </p>

              {maskedDestination() && (
                <p className="mt-1 text-sm font-semibold text-gray-800">
                  {maskedDestination()}
                </p>
              )}

              {error && (
                <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-left">
                  <p className="text-sm text-red-700">
                    {error}
                  </p>
                </div>
              )}

              {success && (
                <div className="mt-5 rounded-lg border border-green-200 bg-green-50 p-3 text-left">
                  <p className="text-sm text-green-700">
                    {success}
                  </p>
                </div>
              )}

              <form
                onSubmit={handleSubmit}
                className="mt-7"
              >
                <div
                  className="flex justify-center gap-2 sm:gap-3"
                  onPaste={handlePaste}
                >
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(element) => {
                        inputRefs.current[index] =
                          element;
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(event) =>
                        handleChange(
                          index,
                          event.target.value
                        )
                      }
                      onKeyDown={(event) =>
                        handleKeyDown(
                          index,
                          event
                        )
                      }
                      disabled={loading}
                      aria-label={`OTP digit ${
                        index + 1
                      }`}
                      className="h-12 w-11 rounded-lg border border-gray-300 text-center text-lg font-semibold text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-50 sm:h-14 sm:w-12"
                    />
                  ))}
                </div>

                <button
                  type="submit"
                  disabled={
                    loading ||
                    otp.join('').length !==
                      OTP_LENGTH
                  }
                  className="mt-7 flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Verifying...
                    </>
                  ) : (
                    'Verify Code'
                  )}
                </button>
              </form>

              <div className="mt-6">
                <p className="text-sm text-gray-500">
                  Didn't receive the code?
                </p>

                <button
                  type="button"
                  onClick={handleResend}
                  disabled={
                    secondsLeft > 0 ||
                    resending
                  }
                  className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  {resending
                    ? 'Sending...'
                    : secondsLeft > 0
                    ? `Resend code in ${secondsLeft}s`
                    : 'Resend verification code'}
                </button>
              </div>

              <div className="mt-6 border-t border-gray-100 pt-5">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-600 hover:text-gray-900"
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyOTP;