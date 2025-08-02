import prisma from "../../../config/db";
import { asyncHandler } from "../../../utils/asyncHandler";
import { deleteFromCloudinary, uploadOnCloudinary } from "../../../utils/cloudinary";
import { handleAddListing, handleUpdateListing } from "../services/listing.service";
import { ListingData, listingSchema } from "../validators/listing.validator";

export const addListing = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        const listingData: ListingData = listingSchema.parse(req.body);

        let mediaFiles: Express.Multer.File[] = [];

        if (Array.isArray(req.files)) {
            mediaFiles = req.files;
        } else if (req.files && Array.isArray(req.files['media'])) {
            mediaFiles = req.files['media'];
        }

        if (mediaFiles.length > 0) {
            const uploadPromises = mediaFiles.map(file =>
                uploadOnCloudinary(file.path, "rakshasetu/listing-media")
            );

            const uploadResults = await Promise.all(uploadPromises);

            const uploadedMediaUrls = uploadResults
                .filter(result => !!result && !!result.url)
                .map(result => result!.url);

            listingData.media = uploadedMediaUrls;
        }


        listingData.price = parseFloat(listingData.price.toString());

        // Proceed to service layer to store in DB
        const response = await handleAddListing(userId, listingData);

        res.status(201).json({
            success: true,
            message: "Listing added successfully",
            data: response
        });

    } catch (err) {
        next(err);
    }
});


export const updateListing = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;
        const listingId = req.params.listingId;

        if (!userId || !listingId) {
            return res.status(400).json({ success: false, message: "Unauthorized or missing listing ID" });
        }

        const listingData: ListingData = listingSchema.parse(req.body);

        let mediaFiles: Express.Multer.File[] = [];

        if (Array.isArray(req.files)) {
            mediaFiles = req.files;
        } else if (req.files && Array.isArray(req.files['media'])) {
            mediaFiles = req.files['media'];
        }

        // 👉 Fetch existing listing's media first
        const existingListing = await prisma.listing.findUnique({
            where: { id: listingId },
            select: { media: true }
        });

        const oldMedia = Array.isArray(existingListing?.media) ? existingListing.media : [];

        // 👉 Upload new files if any
        let newMedia: string[] = [];
        if (mediaFiles.length > 0) {
            const uploadPromises = mediaFiles.map(file =>
                uploadOnCloudinary(file.path, "rakshasetu/listing-media")
            );

            const uploadResults = await Promise.all(uploadPromises);

            newMedia = uploadResults
                .filter(result => !!result?.url)
                .map(result => result!.url);
        }

        listingData.media = [...oldMedia, ...newMedia];

        listingData.price = parseFloat(listingData.price.toString());

        // Send to service
        const response = await handleUpdateListing(userId, listingId, listingData);

        res.status(200).json({
            success: true,
            message: "Listing updated successfully",
            data: response
        });

    } catch (err) {
        next(err);
    }
});


export const deleteListing = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;
        const listingId = req.params.listingId;

        if (!userId || !listingId) {
            return res.status(400).json({ success: false, message: "Unauthorized or missing listing ID" });
        }

        const existingListing = await prisma.listing.findUnique({ where: { id: listingId } });
        if (!existingListing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        if (existingListing.sellerId !== userId) {
            return res.status(403).json({ success: false, message: "You are not authorized to delete this listing" });
        }

        // Optionally delete media from Cloudinary if needed

        if (Array.isArray(existingListing.media) && existingListing.media.length > 0) {
            const deletePromises = existingListing.media.map(url => {
                if (typeof url !== "string" || !url) return Promise.resolve();

                try {
                    // Extract public_id from full Cloudinary URL
                    const parts = url.split('/');
                    const fileNameWithExt = parts.slice(-1)[0]; // "abc123xyz.jpg"
                    const fileName = fileNameWithExt.split('.')[0]; // "abc123xyz"
                    const folderPath = parts.slice(-2, -1)[0]; // "listing-media"
                    const publicId = `rakshasetu/${folderPath}/${fileName}`; // full public ID

                    return deleteFromCloudinary(publicId);
                } catch {
                    return Promise.resolve(); // fallback if parsing fails
                }
            });

            await Promise.all(deletePromises);
        }


        // Proceed to delete
        await prisma.listing.delete({ where: { id: listingId } });

        res.status(200).json({
            success: true,
            message: "Listing deleted successfully"
        });

    } catch (err) {
        next(err);
    }
})


export const getLoggedUserListings = asyncHandler(async (req, res, next) => {
    try {
        const userId = req?.user?.id;

        if (!userId) {
            return res.status(400).json({ success: false, message: "Not authorized" });
        }

        const listings = await prisma.listing.findMany({
            where: { sellerId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: listings
        });

    } catch (err) {
        next(err);
    }
})

export const getSingleListing = asyncHandler(async (req, res, next) => {
    try {
        const listingId = req.params.listingId;

        if (!listingId) {
            return res.status(400).json({ success: false, message: "Listing ID is required" });
        }

        const listing = await prisma.listing.findUnique({
            where: { id: listingId },
            include: {
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });

        if (!listing) {
            return res.status(404).json({ success: false, message: "Listing not found" });
        }

        res.status(200).json({
            success: true,
            data: listing
        });

    } catch (err) {
        next(err);
    }
});


export const getUserListings = asyncHandler(async (req, res, next) => {
    try {
        const userId = req.params.userId;

        if (!userId) {
            return res.status(400).json({ success: false, message: "User ID is required" });
        }

        const listings = await prisma.listing.findMany({
            where: { sellerId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        image: true,
                    }
                }
            }
        });

        res.status(200).json({
            success: true,
            data: listings
        });

    } catch (err) {
        next(err);
    }
})