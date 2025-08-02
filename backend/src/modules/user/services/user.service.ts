import prisma from "../../../config/db";
import { AppError } from "../../../utils/AppError";
import bcrypt from "bcryptjs";
import axios from "axios";

export const handleChangePassword = async (
    userId: string,
    oldPassword: string,
    newPassword: string
): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const isValid = await bcrypt.compare(oldPassword, user.password);
    if (!isValid) throw new AppError('Invalid old password', 401);

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedNewPassword,
        },
    });
}

export const handleUpdateUser = async (
    userId: string,
    userData: {
        firstName?: string;
        lastName?: string;
        userName?: string;
        email?: string;
        mobile?: string;
        address?: {
            street?: string;
            city?: string;
            state?: string;
            country?: string;
            pinCode?: string;
        };
        image?: string;
        business?: string;
    }
): Promise<void> => {

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const updatedData = {
        ...userData,
    };

    await prisma.user.update({
        where: { id: user.id },
        data: updatedData,
    });
}

export const getSandboxAccessToken = async (): Promise<string> => {
    try {
        const response = await axios.post(
            'https://api.sandbox.co.in/authenticate',
            {},
            {
                headers: {
                    'x-api-secret': process.env.SANDBOX_API_SECRET!,
                    'x-api-key': process.env.SANDBOX_API_KEY!,
                    'x-api-version': '1.0',
                    "Content-Type": "application/json",
                },
            }
        );

        return (response.data as { access_token: string }).access_token;

    } catch (error: any) {
        console.error("Error fetching Sandbox token:", error?.response?.data || error.message);
        throw new Error("Failed to get Sandbox access token");
    }
};
export const handleVerifyKyc = async (
    userId: string,
    fullNameAsPerAadhar: string,
    fullNameAsPerPan: string,
    aadharNumber: string,
    dateOfBirth: string,
    panNumber: string
): Promise<{ status: string; message: string; referenceId?: string }> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const accessToken = await getSandboxAccessToken();

    // ---------- PAN Verification ----------
    const panRes = await axios.post(
        'https://api.sandbox.co.in/kyc/pan/verify',
        {
            '@entity': 'in.co.sandbox.kyc.pan_verification.request',
            pan: panNumber,
            name_as_per_pan: fullNameAsPerPan,
            date_of_birth: dateOfBirth,
            consent: 'Y',
            reason: 'KYC Verification',
        },
        {
            headers: {
                authorization: accessToken,
                'Content-Type': 'application/json',
                'x-api-key': process.env.SANDBOX_API_KEY!,
                'x-accept-cache': true,
                'x-api-version': '1.0',
            },
        }
    );

    const panData = panRes.data as {
        code: number;
        data: {
            status: string;
            message?: string;
        };
    };

    if (panData.code > 200 || panData.data.status !== 'valid') {
        await prisma.user.update({
            where: { id: userId },
            data: { kycVerified: 'REJECTED' },
        });

        await prisma.userKycDetails.create({
            data: {
                userId,
                panNumber,
                fullNameAsPerPan,
                dateOfBirth,
                panVerificationStatus: 'REJECTED',
                panRejectionReason: panData.data?.message || 'PAN verification failed',
            },
        });

        throw new AppError('PAN verification failed', 400);
    }

    // ---------- PAN is Valid ----------
    await prisma.user.update({
        where: { id: userId },
        data: { kycVerified: 'PENDING' },
    });

    // Create KYC record (if not already) or update
    await prisma.userKycDetails.upsert({
        where: { userId },
        update: {
            panNumber,
            fullNameAsPerPan,
            dateOfBirth,
            panVerificationStatus: 'PENDING',
        },
        create: {
            userId,
            panNumber,
            fullNameAsPerPan,
            dateOfBirth,
            panVerificationStatus: 'PENDING',
        },
    });

    // ---------- Aadhaar OTP Generation ----------
    const aadhaarRes = await axios.post(
        'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp',
        {
            '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.otp.request',
            aadhaar_number: aadharNumber,
            consent: 'Y',
            reason: 'KYC Verification',
        },
        {
            headers: {
                authorization: accessToken,
                'Content-Type': 'application/json',
                'x-api-key': process.env.SANDBOX_API_KEY!,
                'x-accept-cache': true,
                'x-api-version': '2.0',
            },
        }
    );

    const aadharData = aadhaarRes.data as {
        data?: { message?: string; reference_id?: string };
        message?: string;
    };

    const message = aadharData?.data?.message || aadharData?.message || '';
    const referenceId = aadharData?.data?.reference_id;

    if (message === 'OTP sent successfully') {
        // Save Aadhaar data in KYC details
        await prisma.userKycDetails.update({
            where: { userId },
            data: {
                fullNameAsPerAadhar,
                aadharNumber,
                aadharVerificationStatus: 'PENDING',
                aadhaarReferenceId: referenceId?.toString() || null,
            },
        });

        return {
            status: 'OTP_SENT',
            message: 'OTP sent successfully to Aadhaar-linked mobile number.',
            referenceId,
        };
    }

    // ---------- Aadhaar OTP Fail Scenarios ----------
    if (message === 'Aadhaar not linked to mobile number') {
        return {
            status: 'OTP_FAILED',
            message: 'Aadhaar is not linked to a mobile number.',
        };
    }

    if (message === 'Invalid Aadhaar Card') {
        return {
            status: 'OTP_FAILED',
            message: 'Invalid Aadhaar number provided.',
        };
    }

    if (message?.includes('please try after')) {
        return {
            status: 'OTP_FAILED',
            message,
        };
    }

    return {
        status: 'OTP_FAILED',
        message: 'Aadhaar OTP generation failed due to unknown error.',
    };
};

export const handleVerifyAadharOtp = async (
    userId: string,
    otp: string
): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const kycDetails = await prisma.userKycDetails.findUnique({ where: { userId } });
    if (!kycDetails || !kycDetails.aadhaarReferenceId) {
        throw new AppError('KYC details not found or Aadhaar reference ID missing', 404);
    }

    const accessToken = await getSandboxAccessToken();

    let otpRes;
    try {
        otpRes = await axios.post(
            'https://api.sandbox.co.in/kyc/aadhaar/okyc/otp/verify',
            {
                '@entity': 'in.co.sandbox.kyc.aadhaar.okyc.request',
                reference_id: kycDetails.aadhaarReferenceId,
                otp,
            },
            {
                headers: {
                    authorization: accessToken,
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.SANDBOX_API_KEY!,
                    'x-api-version': '2.0',
                },
            }
        );
    } catch (error: any) {
        const errorMessage =
            error.response?.data?.message || 'Failed to verify Aadhaar OTP';
        throw new AppError(errorMessage, error.response?.status || 500);
    }

    const { code, data, message } = otpRes.data as {
        code: number;
        data?: { status?: string; message?: string };
        message?: string;
    };

    const apiMessage = data?.message || message || '';
    const status = data?.status || '';

    if (status.toUpperCase() === 'VALID') {
        await prisma.user.update({
            where: { id: userId },
            data: { kycVerified: 'APPROVED' },
        });

        await prisma.userKycDetails.update({
            where: { userId },
            data: { aadharVerificationStatus: 'APPROVED', panVerificationStatus: 'APPROVED' },
        });

        return;
    }

    if (
        apiMessage === 'Invalid OTP' ||
        apiMessage === 'Invalid Reference Id' ||
        apiMessage === 'OTP expired' ||
        apiMessage === 'OTP missing in request'
    ) {
        throw new AppError(apiMessage, 400);
    }

    if (apiMessage.includes('please try after')) {
        throw new AppError(apiMessage, 429); // Too Many Requests
    }

    throw new AppError('Aadhaar OTP verification failed. Please try again.', 400);
};

export const handleVerifyBankDetails = async (
    userId: string,
    accountHolderName: string,
    accountNumber: string,
    ifscCode: string
): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const kycDetails = await prisma.userKycDetails.findUnique({ where: { userId } });
    if (!kycDetails) throw new AppError('KYC record not found', 404);

    const accessToken = await getSandboxAccessToken();

    let apiResponse;
    try {
        const res = await axios.get(
            `https://api.sandbox.co.in/bank/${ifscCode}/accounts/${accountNumber}/penniless-verify`,
            {
                headers: {
                    authorization: accessToken,
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.SANDBOX_API_KEY!,
                    'x-accept-cache': true,
                    'x-api-version': '1.0',
                },
            }
        );
        apiResponse = res.data;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Unknown error during bank verification';
        const statusCode = error?.response?.status || 500;
        throw new AppError(`Bank verification failed: ${message}`, statusCode);
    }

    const { code, data } = apiResponse as { code: number; data: any; message?: string };

    if (code !== 200) {
        const responseMessage = (apiResponse as { message?: string })?.message;
        throw new AppError(`Unexpected response: ${responseMessage}`, code);
    }

    const message = data?.message?.toLowerCase?.();
    const accountExists = data?.account_exists ?? data?.account_exist;

    if (
        !accountExists ||
        message?.includes('invalid') ||
        message?.includes('offline') ||
        message?.includes('fail') ||
        message?.includes('blocked') ||
        message?.includes('unavailable')
    ) {
        throw new AppError(`Bank verification failed: ${data?.message || 'Unknown reason'}`, 400);
    }

    const nameAtBank = data?.name_at_bank?.toLowerCase()?.trim();
    const inputName = accountHolderName.toLowerCase().trim();

    if (nameAtBank && !nameAtBank.includes(inputName) && !inputName.includes(nameAtBank)) {
        throw new AppError(`Name mismatch. Bank returned: "${nameAtBank}"`, 400);
    }

    await prisma.userKycDetails.update({
        where: { userId },
        data: {
            fullNameAsPerBank: nameAtBank || accountHolderName,
            bankAccountNumber: accountNumber,
            bankIfscCode: ifscCode,
            bankVerificationStatus: 'APPROVED',
        },
    });
};


export const handleVerifyGst = async (
    userId: string,
    gstNumber: string
): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const kycDetails = await prisma.userKycDetails.findUnique({ where: { userId } });
    if (!kycDetails) throw new AppError('KYC record not found', 404);

    const accessToken = await getSandboxAccessToken();

    let apiResponse;
    try {
        const res = await axios.post(
            `https://api.sandbox.co.in/gst/compliance/public/gstin/search`,
            { gstin: gstNumber },
            {
                headers: {
                    authorization: accessToken,
                    'Content-Type': 'application/json',
                    'x-api-key': process.env.SANDBOX_API_KEY!,
                    'x-accept-cache': true,
                    'x-api-version': '1.0',
                },
            }
        );
        apiResponse = res.data;
    } catch (error: any) {
        const message = error?.response?.data?.message || 'Unknown error during GST verification';
        const statusCode = error?.response?.status || 500;
        throw new AppError(`GST verification failed: ${message}`, statusCode);
    }

    const { code, data } = apiResponse as {
        code: number;
        data?: any;
        message?: string;
    };

    if (code !== 200) {
        const responseMessage = (apiResponse as { message?: string })?.message;
        throw new AppError(`Unexpected response: ${responseMessage}`, code);
    }

    const statusCd = data?.status_cd;

    if (statusCd === '0') {
        const reason = data?.error?.message || 'GST number not found';
        throw new AppError(`GST verification failed: ${reason}`, 400);
    }

    const gstData = data?.data;

    if (!gstData || gstData.gstin !== gstNumber) {
        throw new AppError('Invalid GST data received', 400);
    }

    const {
        ctb: constitution,
        rgdt: registrationDate,
        lgnm: businessName,
        tradeNam: tradeName,
        pradr: { addr: primaryAddress },
    } = gstData;

    await prisma.userKycDetails.update({
        where: { userId },
        data: {
            gstNumber,
            gstVerificationStatus: 'APPROVED',
            constitution,
            registrationDate,
            businessName,
            tradeName,
            businessAddress: primaryAddress,
        },
    });
};


export const handleGetLoggedUserDetails = async (userId: string): Promise<any> => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            UserKycDetails: true
        },
    });

    if (!user) throw new AppError('User not found', 404);

    return {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        userName: user.userName,
        email: user.email,
        mobile: user.mobile,
        address: user.address,
        image: user.image,
        business: user.business,
        userKycDetails: user.UserKycDetails || null,
    };
}