import { asyncHandler } from "../../../utils/asyncHandler";
import { uploadOnCloudinary } from "../../../utils/cloudinary";
import { handleChangePassword, handleGetLoggedUserDetails, handleUpdateUser, handleVerifyAadharOtp, handleVerifyBankDetails, handleVerifyGst, handleVerifyKyc } from "../services/user.service";
import { bankVerificationSchema, changePasswordSchema, gstVerificationSchema, kycVerificationSchema } from "../validators/user.validator";


export const changePassword = asyncHandler(async (req, res, next) => {
    try {

        const { oldPassword, newPassword, conPassword } = changePasswordSchema.parse(req.body);
        const userId = req?.user?.id;

        if (newPassword !== conPassword) {
            return res.status(400).json({ success: false, message: "New password and confirmation do not match" });
        }

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        await handleChangePassword(userId, oldPassword, newPassword);

        res.status(200).json({ success: true, message: "Password changed successfully" });


    } catch (err) {
        next(err);
    }
})

export const updateUser = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        const userData = req.body;
        const image = req.file ? req.file.path : undefined;

        let imageUrl = "";

        if (image) {
            const uploadResult = await uploadOnCloudinary(image, "rakshasetu/user-images");

            if (!uploadResult) {
                return res.status(500).json({ success: false, message: "Failed to upload image" });
            }

            imageUrl = uploadResult?.url ?? "";
        }

        await handleUpdateUser(userId, { ...userData, image: imageUrl || undefined });

        res.status(200).json({ success: true, message: "User updated successfully" });

    } catch (err) {
        next(err);
    }
})

export const verifyKyc = asyncHandler(async (req, res, next) => {
    try {

        const userId = req?.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        const { FullNameAsPerAadhar, FullNameAsPerPan, aadharNumber, dateOfBirth, panNumber } = kycVerificationSchema.parse(req.body);

        const response = await handleVerifyKyc(userId,
            FullNameAsPerAadhar, FullNameAsPerPan, aadharNumber, dateOfBirth, panNumber
        );

        res.status(200).json({ success: true, res_status: response.status, message: response.message });


    } catch (err) {
        next(err);
    }
})
export const verifyAdharOtp = asyncHandler(async (req, res, next) => {
    try {

        const { otp } = req.body;

        const userId = req?.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        if (!otp || otp.length !== 6) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        await handleVerifyAadharOtp(userId, otp);

        res.status(200).json({ success: true, message: "KYC details verified successfully" });


    } catch (err) {
        next(err);
    }
})


export const verifyBankDetails = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;

        const { accountHolderName, accountNumber, ifscCode } = bankVerificationSchema.parse(req.body);

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        const response = await handleVerifyBankDetails(userId, accountHolderName, accountNumber, ifscCode);

        res.status(200).json({ success: true, message: "Bank details verified successfully" });

    } catch (err) {
        next(err);
    }
})


export const verifyGst = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;

        const { gstNumber } = gstVerificationSchema.parse(req.body);

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        if (!gstNumber) {
            return res.status(400).json({ success: false, message: "Invalid GST number" });
        }

        await handleVerifyGst(userId, gstNumber);

        res.status(200).json({ success: true, message: "GST verified successfully" });

    } catch (err) {
        next(err);
    }
})

export const getLoggedUserDetails = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        const userDetails = await handleGetLoggedUserDetails(userId);

        res.status(200).json({ success: true, data: userDetails });

    } catch (err) {
        next(err);
    }
});