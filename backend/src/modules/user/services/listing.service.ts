import prisma from "../../../config/db";
import { AppError } from "../../../utils/AppError";
import { generateUID } from "../../../utils/generateUid";
import { ListingData } from "../validators/listing.validator";

export const handleAddListing = async (userId: string, listingData: ListingData) => {

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const listingId = await generateUID('lst', 'listing', 'id', 8);

    const newListing = await prisma.listing.create({
        data: {
            id: listingId,
            ...listingData,
            sellerId: user.id,
        },
    });

    return newListing;

}

export const handleUpdateListing = async (userId: string, listingId: string, listingData: ListingData) => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new AppError('User not found', 404);

    const existingListing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!existingListing) throw new AppError('Listing not found', 404);

    if (existingListing.sellerId !== user.id) {
        throw new AppError('You are not authorized to update this listing', 403);
    }

    const updatedListing = await prisma.listing.update({
        where: { id: listingId },
        data: listingData,
    });

    return updatedListing;
}