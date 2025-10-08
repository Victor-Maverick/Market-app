import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export interface VerificationResponse {
    success: boolean;
    message: string;
}

export interface OTPVerificationResponse {
    success: boolean;
    message: string;
    remainingAttempts?: number;
    isExpired?: boolean;
}

export interface OTPRequest {
    email: string;
    otp: string;
}

export interface ResendOTPRequest {
    email: string;
}

export const userService = {
    // Verify user email with token
    verifyEmail: async (token: string): Promise<VerificationResponse> => {
        try {
            const response = await axios.get(`${API_BASE_URL}/auth/verify?token=${token}`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.message || error.message
                };
            }
            return {
                success: false,
                message: 'Verification failed'
            };
        }
    },

    // Resend verification email
    resendVerificationEmail: async (email: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users/resend-verification`, {
                email
            });
            return {
                success: true,
                message: response.data || 'Verification email sent successfully'
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to resend verification email'
            };
        }
    },

    // Verify OTP
    verifyOTP: async (email: string, otp: string): Promise<OTPVerificationResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/verify-otp`, {
                email,
                otp
            });
            return response.data.data || response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.data?.message || error.response?.data?.message || error.message,
                    remainingAttempts: error.response?.data?.data?.remainingAttempts,
                    isExpired: error.response?.data?.data?.isExpired
                };
            }
            return {
                success: false,
                message: 'OTP verification failed'
            };
        }
    },

    // Resend OTP
    resendOTP: async (email: string): Promise<OTPVerificationResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/resend-otp`, {
                email
            });
            return response.data.data || response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.data?.message || error.response?.data?.message || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to resend OTP'
            };
        }
    },

    // Send verification OTP (from login page)
    sendVerificationOTP: async (email: string): Promise<OTPVerificationResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/send-verification-otp`, {
                email
            });
            return response.data.data || response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.data?.message || error.response?.data?.message || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to send verification OTP'
            };
        }
    },

    // Add role to user
    addRoleToUser: async (email: string, roleName: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users/add-role`, {
                email,
                roleName
            });
            return {
                success: response.status === 201,
                message: response.data || 'Role added successfully'
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to add role'
            };
        }
    },

    // Forgot password - send reset OTP
    forgotPassword: async (email: string): Promise<OTPVerificationResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/forgot-password`, {
                email
            });
            return response.data.data || response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.data?.message || error.response?.data?.message || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to send password reset code'
            };
        }
    },

    // Verify password reset OTP
    verifyPasswordResetOTP: async (email: string, otp: string): Promise<OTPVerificationResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/verify-password-reset-otp`, {
                email,
                otp
            });
            return response.data.data || response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.data?.message || error.response?.data?.message || error.message,
                    remainingAttempts: error.response?.data?.data?.remainingAttempts,
                    isExpired: error.response?.data?.data?.isExpired
                };
            }
            return {
                success: false,
                message: 'OTP verification failed'
            };
        }
    },

    // Reset password with OTP
    resetPasswordWithOTP: async (email: string, otp: string, newPassword: string): Promise<OTPVerificationResponse> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/auth/reset-password-with-otp`, {
                email,
                otp,
                newPassword
            });
            return response.data.data || response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data?.data?.message || error.response?.data?.message || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to reset password'
            };
        }
    },

    // Delete user
    deleteUser: async (userId: number): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await axios.delete(`${API_BASE_URL}/users/delete-user?id=${userId}`);
            return {
                success: true,
                message: response.data || 'User deleted successfully'
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to delete user'
            };
        }
    },

    // Register logistics partner admin
    registerLogisticsPartner: async (userData: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
    }): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await axios.post(`${API_BASE_URL}/users/register-logistics`, userData);
            return {
                success: true,
                message: response.data || 'Logistics partner registered successfully'
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                return {
                    success: false,
                    message: error.response?.data || error.message
                };
            }
            return {
                success: false,
                message: 'Failed to register logistics partner'
            };
        }
    },


};

export default userService;