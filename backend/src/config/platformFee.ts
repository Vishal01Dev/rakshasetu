import prisma from "./db"; // adjust path if needed

export async function calculatePlatformFee(orderAmount: number): Promise<number> {
    let setting = await prisma.platformSetting.findUnique({
        where: { id: 1 },
    });

    if (!setting) {
        // Create with default values if missing
        setting = await prisma.platformSetting.create({
            data: {
                id: 1,
                feeType: 'PERCENTAGE',
                feeValue: 2,
            },
        });
    }

    const { feeType, feeValue } = setting;

    const fee = feeType === 'PERCENTAGE'
        ? (orderAmount * feeValue) / 100
        : feeValue;

    return parseFloat(fee.toFixed(2));
}