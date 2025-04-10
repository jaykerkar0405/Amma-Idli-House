import {
	TWILIO_AUTH_TOKEN,
	TWILIO_ACCOUNT_SID,
	TWILIO_VERIFY_SERVICE_SID
} from '$env/static/private';
import pkg from 'twilio';
import prisma from './prisma';
import { betterAuth } from 'better-auth';
import { phoneNumber } from 'better-auth/plugins';
import { PUBLIC_BETTER_AUTH_URL } from '$env/static/public';
import { prismaAdapter } from 'better-auth/adapters/prisma';

const { Twilio } = pkg;

export const auth = betterAuth({
	trustedOrigins: [PUBLIC_BETTER_AUTH_URL],
	database: prismaAdapter(prisma, {
		provider: 'postgresql'
	}),
	plugins: [
		phoneNumber({
			sendOTP: async ({ phoneNumber }) => {
				const client = new Twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

				await client.verify.v2.services(TWILIO_VERIFY_SERVICE_SID).verifications.create({
					channel: 'sms',
					to: phoneNumber
				});
			},
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
