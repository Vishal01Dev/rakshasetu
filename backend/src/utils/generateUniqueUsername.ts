import prisma from '../config/db';

function randomSuffix(length = 4) {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export const generateUniqueUsername = async (firstName: string, lastName: string): Promise<string> => {
    const base = `${firstName}.${lastName}`.toLowerCase().replace(/\s+/g, '');

    while (true) {
        const suffix = randomSuffix(4); // you can adjust the length
        const userName = `${base}.${suffix}`;
        const existing = await prisma.user.findUnique({ where: { userName } });

        if (!existing) return userName;
    }
};
