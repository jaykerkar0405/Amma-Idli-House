import prisma from './prisma';
import { betterAuth } from 'better-auth';
import { phoneNumber } from 'better-auth/plugins';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { prismaAdapter } from 'better-auth/adapters/prisma';

export const auth = betterAuth({
	trustedOrigins: [PUBLIC_BETTER_AUTH_URL],
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	plugins: [
		phoneNumber({
			sendOTP: ({ phoneNumber, code }, request) => {},
			signUpOnVerification: {
				getTempName: (phoneNumber) => {
					return phoneNumber;
				},
				getTempEmail: (phoneNumber) => {
					return `${phoneNumber}@ammasidli.in`;
				}
			}
		})
	]
});
